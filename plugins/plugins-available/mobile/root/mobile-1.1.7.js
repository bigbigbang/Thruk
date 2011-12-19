/* create the jquery mobile object */
var filter          = undefined;
var current_host    = undefined;
var current_service = undefined;

jQuery(document).bind("mobileinit", function(){
    jQuery.mobile.page.prototype.options.backBtnText      = "back";
    jQuery.mobile.page.prototype.options.addBackBtn       = true;
    jQuery.mobile.page.prototype.options.backBtnTheme     = "d";
    jQuery.mobile.page.prototype.options.headerTheme      = "d";
    jQuery.mobile.page.prototype.options.contentTheme     = "c";
    jQuery.mobile.page.prototype.options.footerTheme      = "d";

    jQuery.mobile.listview.prototype.options.headerTheme  = "d";
    jQuery.mobile.listview.prototype.options.theme        = "d";
    jQuery.mobile.listview.prototype.options.dividerTheme = "d";

    jQuery.mobile.listview.prototype.options.splitTheme   = "d";
    jQuery.mobile.listview.prototype.options.countTheme   = "d";
    jQuery.mobile.listview.prototype.options.filterTheme  = "d";
});

/* initialize all events */
jQuery(document).ready(function(e){
    /* refresh button on start page */
    jQuery("#refresh").bind( "vclick", function(event, ui) {
        refresh_host_status(true);
        refresh_service_status(true);
        return false;
    });

    /* bind filter settings to links */
    jQuery("LI.hosts_total_panel A.hosts_list").bind(       "vclick", function(event, ui) { filter={}; });
    jQuery("LI.hosts_pending_panel A.hosts_list").bind(     "vclick", function(event, ui) { filter={ hoststatustypes:1 }; });
    jQuery("LI.hosts_up_panel A.hosts_list").bind(          "vclick", function(event, ui) { filter={ hoststatustypes:2 }; });
    jQuery("LI.hosts_down_panel A.hosts_list").bind(        "vclick", function(event, ui) { filter={ hoststatustypes:4 }; });
    jQuery("LI.hosts_unreachable_panel A.hosts_list").bind( "vclick", function(event, ui) { filter={ hoststatustypes:8 }; });

    jQuery("LI.services_total_panel A.services_list").bind(   "vclick", function(event, ui) { filter={}; });
    jQuery("LI.services_pending_panel A.services_list").bind( "vclick", function(event, ui) { filter={ servicestatustypes:1 }; });
    jQuery("LI.services_ok_panel A.services_list").bind(      "vclick", function(event, ui) { filter={ servicestatustypes:2 }; });
    jQuery("LI.services_warning_panel A.services_list").bind( "vclick", function(event, ui) { filter={ servicestatustypes:4 }; });
    jQuery("LI.services_unknown_panel A.services_list").bind( "vclick", function(event, ui) { filter={ servicestatustypes:8 }; });
    jQuery("LI.services_critical_panel A.services_list").bind("vclick", function(event, ui) { filter={ servicestatustypes:16 }; });

    /* Last Alerts */
    jQuery('#last_alerts').bind('pageshow', function(event, info){
        jQuery('#alerts_list').children().remove();
        jQuery('#alerts_list').append('<li><img src="' + url_prefix + 'thruk/plugins/mobile/img/loading.gif" alt="loading"> loading</li>');
        jQuery.get('mobile.cgi', {
                data: 'alerts',
                limit:25
            },
            function(data, textStatus, XMLHttpRequest) {
                jQuery('#alerts_list').children().remove();
                jQuery.each(data, function(index, entry) {
                    var listitem = '';
                    if(entry.service_description) {
                        listitem = '<li class="'+get_service_class_for_state(entry.state)+'">';
                    } else {
                        listitem = '<li class="'+get_host_class_for_state(entry.state)+'">';
                    }
                    var message = entry.message.substr(13);
                    message = message.replace(entry.type+':', '');
                    if(message.length > 60) {
                        message = message.substr(0,60) + '...';
                    }
                    listitem += '<span class="logdate">' + entry.formated_time + '<\/span>';
                    listitem += '<span class="logtype">' + entry.type + '<\/span>';
                    listitem += '<br><span class="logmsg">' + message + '<\/span><\/li>';
                    jQuery('#alerts_list').append(listitem);
                });
                jQuery('#alerts_list').listview('refresh');
            },
            'json');
    });

    /* Last Notifications */
    jQuery('#last_notification').bind('pageshow', function(event, info){
        jQuery('#notification_list').children().remove();
        jQuery('#notification_list').append('<li><img src="' + url_prefix + 'thruk/plugins/mobile/img/loading.gif" alt="loading"> loading</li>');
        jQuery.get('mobile.cgi', {
                data: 'notifications',
                limit:25
            },
            function(data, textStatus, XMLHttpRequest) {
                jQuery('#notification_list').children().remove();
                jQuery.each(data, function(index, entry) {
                    if(entry.service_description) {
                        jQuery('#notification_list').append('<li class="'+get_service_class_for_state(entry.state)+'"><span class="date">' + entry.formated_time + '</span><br>' + entry.host_name+' - '+ entry.service_description +'</li>');
                    } else {
                        jQuery('#notification_list').append('<li class="'+get_host_class_for_state(entry.state)+'"><span class="date">' + entry.formated_time + '</span><br>' + entry.host_name+'</li>');
                    }
                });
                jQuery('#notification_list').listview('refresh');
            },
            'json');
    });

    /* Services List */
    jQuery('#services_list').bind('pageshow', function(event, info){
        jQuery('#services_list_data').children().remove();
        jQuery('#services_list_data').append('<li><img src="' + url_prefix + 'thruk/plugins/mobile/img/loading.gif" alt="loading"> loading</li>');
        jQuery.get('mobile.cgi', {
                data: 'services',
                filter: filter,
                _:unixtime()
            },
            function(data, textStatus, XMLHttpRequest) {
                jQuery('#services_list_data').children().remove();
                jQuery.each(data, function(index, entry) {
                    jQuery('#services_list_data').append('<li class="'+get_service_class(entry)+'"><a href="#service" class="service_link" data-host="' + entry.host_name +'" data-service="'+entry.description+'">' + entry.host_name+' - '+ entry.description +'</a></li>');
                });
                jQuery('#services_list_data').listview('refresh');
                jQuery("A.service_link").bind( "vclick", function(event, ui) { current_host=event.target.dataset.host; current_service=event.target.dataset.service; });
            },
            'json');
    });

    /* Hosts List */
    jQuery('#hosts_list').bind('pageshow', function(event, data){
        jQuery('#hosts_list_data').children().remove();
        jQuery('#hosts_list_data').append('<li><img src="' + url_prefix + 'thruk/plugins/mobile/img/loading.gif" alt="loading"> loading</li>');
        jQuery.get('mobile.cgi', {
                data: 'hosts',
                filter: filter,
                _:unixtime()
            },
            function(data, textStatus, XMLHttpRequest) {
                jQuery('#hosts_list_data').children().remove();
                jQuery.each(data, function(index, entry) {
                    jQuery('#hosts_list_data').append('<li class="'+get_host_class(entry)+'"><a href="#host" class="host_link" data-host="'+entry.name +'">' + entry.name +'</a></li>');
                });
                jQuery('#hosts_list_data').listview('refresh');
                jQuery("A.host_link").bind( "vclick", function(event, ui) { current_host=event.target.dataset.host; });
            },
            'json');
    });

    /* Host */
    jQuery('#host').bind('pageshow', function(event, data){
        jQuery.get('mobile.cgi', {
                data: 'hosts',
                host: current_host,
                _:    unixtime()
            },
            function(data, textStatus, XMLHttpRequest) {
                var host = data[0];
                if(host != undefined) {
                    var state_type = "SOFT";
                    if(host.state_type == 1) { state_type = "HARD"; }
                    jQuery('#host_attempt').text(host.current_attempt + '/' + host.max_check_attempts + '  (' + state_type + ' state)');
                    jQuery('#host_name').text(host.name);
                    jQuery('#host_state').removeClass().text(get_host_status(host)).addClass(get_host_class(host));
                    jQuery('#host_duration').text(host.duration);
                    jQuery('#host_latency').text(Math.round(host.latency*1000)/1000 + 's');
                    jQuery('#host_exec_time').text(Math.round(host.execution_time*1000)/1000 + 's');
                    if(host.last_check > 0) {
                        jQuery('#host_last_check').text(host.format_last_check);
                    } else {
                        jQuery('#host_last_check').text('never');
                    }
                    if(host.next_check > 0) {
                        jQuery('#host_next_check').text(host.format_next_check);
                    } else {
                        jQuery('#host_last_check').text('N/A');
                    }
                    if(host.check_type == 0) {
                        jQuery('#host_check_type').text('ACTIVE');
                    } else {
                        jQuery('#host_check_type').text('PASSIVE');
                    }
                    jQuery('#host_plugin_output').text(host.plugin_output);
                }
            },
            'json');
    });

    /* Service */
    jQuery('#service').bind('pageshow', function(event, data){
        jQuery.get('mobile.cgi', {
                data: 'services',
                host: current_host,
                service: current_service,
                _:unixtime()
            },
            function(data, textStatus, XMLHttpRequest) {
                var service = data[0];
                if(service != undefined) {
                    var state_type = "SOFT";
                    if(service.state_type == 1) { state_type = "HARD"; }
                    jQuery('#service_attempt').text(service.current_attempt + '/' + service.max_check_attempts + '  (' + state_type + ' state)');
                    jQuery('#service_name').text(service.name);
                    jQuery('#service_state').removeClass().text(get_service_status(service)).addClass(get_service_class(service));
                    jQuery('#service_duration').text(service.duration);
                    jQuery('#service_latency').text(Math.round(service.latency*1000)/1000 + 's');
                    jQuery('#service_exec_time').text(Math.round(service.execution_time*1000)/1000 + 's');
                    if(service.last_check > 0) {
                        jQuery('#service_last_check').text(service.format_last_check);
                    } else {
                        jQuery('#service_last_check').text('never');
                    }
                    if(service.next_check > 0) {
                        jQuery('#service_next_check').text(service.format_next_check);
                    } else {
                        jQuery('#service_last_check').text('N/A');
                    }
                    if(service.check_type == 0) {
                        jQuery('#service_check_type').text('ACTIVE');
                    } else {
                        jQuery('#service_check_type').text('PASSIVE');
                    }
                    jQuery('#service_plugin_output').text(service.plugin_output);
                }
            },
            'json');
    });

    /* Home */
    jQuery('#home').bind('pageshow', function(event, data){
        refresh_host_status();
        refresh_service_status();
    });

    /* refresh problems */
    jQuery('#problems').bind('pageshow', function(event, data){
        jQuery('DIV#problems UL.hosts_by_status_list').listview('refresh');
        jQuery('DIV#problems UL.services_by_status_list').listview('refresh');
    });

    /* refresh list of hosts */
    jQuery('#hosts').bind('pageshow', function(event, data){
        jQuery('DIV#hosts .hosts_by_status_list').listview('refresh');
    });

    /* refresh list of services */
    jQuery('#services').bind('pageshow', function(event, data){
        jQuery('DIV#services .services_by_status_list').listview('refresh');
    });

    refresh_host_status();
    refresh_service_status();

    /* hide notice about fullscreen mode */
    if(window.navigator.standalone == true) {
        jQuery('#fullscreenteaser').hide();
    }
});


/* send debug output to firebug console */
function debug(str) {
    if (window.console != undefined) {
        console.debug(str);
    }
}

/* return host status text */
function get_host_status(host) {
    if(host.has_been_checked == 0) { return("PENDING"); }
    if(host.state == 0) { return("UP"); }
    if(host.state == 1) { return("DOWN"); }
    if(host.state == 2) { return("UNREACHABLE"); }
}

/* return host status class */
function get_host_class(host) {
    if(host.has_been_checked == 0) { return("hostPENDING"); }
    if(host.state == 0) { return("hostUP"); }
    if(host.state == 1) { return("hostDOWN"); }
    if(host.state == 2) { return("hostUNREACHABLE"); }
    if(host.state == 3) { return("hostPENDING"); }
}

/* return host status class */
function get_host_class_for_state(state) {
    if(state == 0) { return("hostUP"); }
    if(state == 1) { return("hostDOWN"); }
    if(state == 2) { return("hostUNREACHABLE"); }
    if(state == 3) { return("hostPENDING"); }
}

/* return service status text */
function get_service_status(service) {
    if(service.has_been_checked == 0) { return("PENDING"); }
    if(service.state == 0) { return("OK"); }
    if(service.state == 1) { return("WARNING"); }
    if(service.state == 2) { return("CRITICAL"); }
    if(service.state == 3) { return("UNKNOWN"); }
}

/* return service status class */
function get_service_class(service) {
    if(service.has_been_checked == 0) { return("servicePENDING"); }
    if(service.state == 0) { return("serviceOK"); }
    if(service.state == 1) { return("serviceWARNING"); }
    if(service.state == 2) { return("serviceCRITICAL"); }
    if(service.state == 3) { return("serviceUNKNOWN"); }
    if(service.state == 4) { return("servicePENDING"); }
}

/* return service status class */
function get_service_class_for_state(state) {
    if(state == 0) { return("serviceOK"); }
    if(state == 1) { return("serviceWARNING"); }
    if(state == 2) { return("serviceCRITICAL"); }
    if(state == 3) { return("serviceUNKNOWN"); }
    if(state == 4) { return("servicePENDING"); }
    alert('unknown state' +  state);
}

function unixtime() {
    var d = new Date();
    return(d.getTime());
}

/* set hosts status */
var last_host_refresh = 0;
function refresh_host_status(force) {
    if(force == undefined) { force = false; }
    var date = new Date;
    var now  = parseInt(date.getTime() / 1000);
    if(force == false && now < last_host_refresh + 2) {
        return false;
    }
    last_host_refresh = now;

    ['up', 'down', 'unreachable', 'pending', 'unhandled' ].forEach(function(el){
        jQuery('.hosts_'+el+'_panel').hide();
    });

    jQuery.get('mobile.cgi', { data: 'host_stats', _:unixtime() },
        function(data, textStatus, XMLHttpRequest) {
            ['up', 'down', 'unreachable', 'pending', 'total'].forEach(function(el){
                var val = eval("data."+el);
                jQuery('.hosts_'+el).text(val)
                if(val > 0) { jQuery('.hosts_'+el+'_panel').show(); }
            });
            jQuery('.hosts_unhandled').text('Host: ' + (data.down_and_unhandled + data.unreachable_and_unhandled));
            if(data.down_and_unhandled + data.unreachable_and_unhandled > 0) { jQuery('.hosts_unhandled_panel').show(); }
        },
    'json');
}

/* set service status */
var last_service_refresh = 0;
function refresh_service_status(force) {
    if(force == undefined) { force = false; }
    var date = new Date;
    var now  = parseInt(date.getTime() / 1000);
    if(force == false && now < last_service_refresh + 2) {
        return false;
    }
    last_service_refresh = now;

    ['ok', 'warning', 'critical', 'unknown', 'pending', 'unhandled'].forEach(function(el){
        jQuery('.services_'+el+'_panel').hide();
    });
    jQuery.get('mobile.cgi', { data: 'service_stats', _:unixtime() },
        function(data, textStatus, XMLHttpRequest) {
            ['ok', 'warning', 'critical', 'unknown', 'pending', 'total'].forEach(function(el){
                var val = eval("data."+el);
                jQuery('.services_'+el).text(val)
                if(val > 0) { jQuery('.services_'+el+'_panel').show(); }
            });
            jQuery('.services_unhandled').text('Service: ' + (data.critical_and_unhandled + data.unknown_and_unhandled));
            if(data.critical_and_unhandled + data.unknown_and_unhandled > 0) { jQuery('.services_unhandled_panel').show(); }
        },
    'json');
}