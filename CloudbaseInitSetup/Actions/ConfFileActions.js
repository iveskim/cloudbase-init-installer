// Copyright (c) 2012 Cloudbase Solutions Srl. All rights reserved.

// Begin common utils (as there's no practival way to include a separate script)

// Awful workaround to include common js features
var commonIncludeFileName = "82311161-875A-4587-A86C-9784581D8F56.js";
function loadCommonIncludeFile(fileName) {
    var shell = new ActiveXObject("WScript.Shell");
    var windir = shell.ExpandEnvironmentStrings("%WINDIR%");
    var path = windir + "\\Temp\\" + fileName;
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    return fso.OpenTextFile(path, 1).ReadAll();
}
eval(loadCommonIncludeFile(commonIncludeFileName));
// End workaround

function writeCloudbaseInitConfFileAction() {
    try {
        logMessage("Writing cloudbase-init.conf file");

        var data = Session.Property("CustomActionData").split('|');

        var i = 0;
        var cloudbaseInitConfFolder = data[i++];
        var binFolder = data[i++];
        var logFolder = data[i++];
        var userName = data[i++];
        var injectMetadataPassword = data[i++];
        var userGroups = data[i++];
        var networkAdapterName = data[i++];
        var loggingSerialPortName = data[i++];
        var maasMetadataUrl = trim(data[i++]);
        var maasOAuthConsumerKey = trim(data[i++]);
        var maasOAuthConsumerSecret = trim(data[i++]);
        var maasOAuthTokenKey = trim(data[i++]);
        var maasOAuthTokenSecret = trim(data[i++]);

        var cloudbaseInitConfFile = cloudbaseInitConfFolder + "cloudbase-init.conf";

        var loggingSerialPortSettings = "";
        if (loggingSerialPortName) {
            loggingSerialPortSettings = loggingSerialPortName + ",115200,N,8";
        }

        var bsdtarPath = binFolder + "bsdtar.exe";

        var config = {
            "username": trim(userName),
            "groups": trim(userGroups),
            "inject_user_password": checkBoxValueToBool(injectMetadataPassword),
            "network_adapter": trim(networkAdapterName),
            "config_drive_raw_hhd": "true",
            "config_drive_cdrom": "true",
            "bsdtar_path": bsdtarPath,
            "verbose": "true",
            "debug": "true",
            "logdir": trim(logFolder),
            "logfile": "cloudbase-init.log",
            "logging_serial_port_settings": trim(loggingSerialPortSettings),
            "mtu_use_dhcp_config": true,
            "ntp_use_dhcp_config": true
        };

        if (maasMetadataUrl) {
            config["metadata_services"] = "cloudbaseinit.metadata.services.maasservice.MaaSHttpService";
            config["maas_metadata_url"] = maasMetadataUrl;
            config["maas_oauth_consumer_key"] = maasOAuthConsumerKey;
            config["maas_oauth_consumer_secret"] = maasOAuthConsumerSecret;
            config["maas_oauth_token_key"] = maasOAuthTokenKey;
            config["maas_oauth_token_secret"] = maasOAuthTokenSecret;
        }

        writeConfigFile(cloudbaseInitConfFile, { "DEFAULT": config });

        var cloudbaseInitConfFileUnattend = cloudbaseInitConfFolder + "cloudbase-init-unattend.conf";

        if (!maasMetadataUrl) {
            config["metadata_services"] = "cloudbaseinit.metadata.services.configdrive.ConfigDriveService,cloudbaseinit.metadata.services.httpservice.HttpService,cloudbaseinit.metadata.services.ec2service.EC2Service,cloudbaseinit.metadata.services.maasservice.MaaSHttpService";
        }

        config["plugins"] = "cloudbaseinit.plugins.windows.sethostname.SetHostNamePlugin";
        config["allow_reboot"] = false;
        config["stop_service_on_exit"] = false;
        config["logfile"] = "cloudbase-init-unattend.log";

        writeConfigFile(cloudbaseInitConfFileUnattend, { "DEFAULT": config });

        return MsiActionStatus.Ok;
    }
    catch (ex) {
        logException(ex);
        return MsiActionStatus.Abort;
    }
}
