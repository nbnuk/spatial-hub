<!doctype html>
<html lang="en">
<body>

<div style="width:400px" class="pull-left" ng-controller="LayoutCtrl" id="left-panel">
    <div ng-show="panelMode[0] == 'default'">

        <div sp-menu></div>

        <div sp-map></div>

        <div class="row" name="divSelectedLayer" id="legend"
             style="display:block;overflow:scroll;background-color: #fff">
            <div class="panel panel-default" style="height:100%;box-shadow: 0 0px; border: 0">
                <div class="panel-body" style="padding-top:0px;padding-left:5px">
                    <div ng-show="showOptions[0]" style="padding-right:15px">
                        <div sp-options></div>
                    </div>

                    <div sp-legend ng-show="showLegend[0]"></div>
                </div>
            </div>
        </div>
    </div>

    <div ng-if="panelMode[0] == 'area'">
        <div draw-area config='panelData.area'></div>
    </div>

    <div ng-if="panelMode[0] == 'envelope'">
        <div envelope></div>
    </div>

    <div ng-if="panelMode[0] == 'nearestLocality'" nearest-locality>
    </div>

</div>

<div style="margin-left:400px" id="right-panel">
    <div class="row" style="margin:0px" ng-controller="BasicTilesController as basicTilesController">
        <leaflet id="map" lf-center="australia" layers="layers" controls="controls" bounds="bounds" defaults="defaults"
                 width="100%" height="480px">
            <leaflet-quick-links></leaflet-quick-links>
        </leaflet>
    </div>
</div>

<div style="display:none" id="loginWorkaround"></div>

<r:script disposition="defer">

    var spApp = angular.module('spApp', ["leaflet-directive", 'ngAnimate', 'ui.bootstrap', 'ui.sortable', 'ui.slider',
                'biocache-service', 'facet-auto-complete-service', 'gaz-auto-complete-service', 'layer-distances-service',
                'layers-auto-complete-service', 'layers-service', 'layout-service', 'lists-service', 'map-service',
                'predefined-areas-service', 'predefined-layer-lists-service', 'sandbox-service', 'species-auto-complete-service', 'popup-service',
                'area-list-select-directive', 'gaz-auto-complete-directive', 'google-places', 'layer-auto-complete-directive',
                'layer-list-select-directive', 'layer-list-upload-directive', 'lists-list-directive', 'sandbox-list-directive',
                'sp-menu-directive',
                'select-area-directive', 'select-layers-directive', 'select-species-directive', 'species-auto-complete-directive', 'leaflet-quick-links-directive',
                'add-area-ctrl', 'add-layer-ctrl', 'add-species-ctrl', 'area-report-ctrl', 'background-process-ctrl',
                'basic-tiles-controller', 'csv-ctrl', 'export-checklist-ctrl',
                'export-sample-ctrl', 'layout-ctrl', 'modal-iframe-instance-ctrl',
                'legend-directive',
                'sp-map-directive',
                'envelope-directive',
                'draw-area-directive',
                'nearest-locality-directive',
                'sp-options-directive', 'add-facet-ctrl',
                'phylo-service', 'select-phylo-directive', 'phylo-ctrl',
                'export-map-ctrl', 'export-area-ctrl',
                'species-info-ctrl', 'tabulate-ctrl', 'tool-area-report-ctrl', 'sand-box-ctrl', 'analysis-ctrl',
                'ngAria', 'ngTouch', 'ala.sandbox.components','create-species-list-ctrl',
                'ala.sandbox.preview', 'chieffancypants.loadingBar', 'ngFileUpload', 'playback-directive',
                'colour-service', 'sessions-service', 'sessions-ctrl', 'bie-service'])
            .factory("ConfigService", [function () {
                return {}
            }])

    spApp.value('sandboxConfig', SANDBOX_CONFIG);
    spApp.value('existing', 1 );

    spApp.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
    }]);

    fetchData().then(bootstrapApplication);

    function fetchData() {
        var initInjector = angular.injector(["ng"]);
        var $http = initInjector.get("$http");
        var $q = initInjector.get("$q");
        var $rootScope = initInjector.get("$rootScope");

        spApp.constant("gLayerDistances", {})

        return $q.all([
        ]).then(function (results) {
        });
    }

    function bootstrapApplication() {
        angular.element(document).ready(function () {
            angular.bootstrap(document, ["spApp"]);
            $("#map").height($(window).height() - $('.navbar-header').height());
            $("#legend").height($(window).height() - $('.navbar-header').height() - 195);

            //alter header
            if (SpatialPortalConfig.userId) {
                $('<li class="dropdown font-xsmall"><a href="#" onclick="$(\'#sessionsButton\')[0].click()" data-toggle="dropdown" role="button" aria-expanded="false">Load Session</a></li>').insertBefore($('.navbar-right .dropdown')[0])
                $('<li class="dropdown font-xsmall"><a href="#" onclick="$(\'#saveSessionButton\')[0].click()" data-toggle="dropdown" role="button" aria-expanded="false">Save Session</a></li>').insertBefore($('.navbar-right .dropdown')[0])

                var userEmail = document.cookie.split(';').find ( function ( cookie ) { return cookie.trim().startsWith('ALA-Auth='); } ).trim().replace('ALA-Auth="','').replace('"','')
                $('.navbar-right .dropdown:last a:first').html(userEmail + '<span class="caret"/>')
            } else {
                var a = $('<li class="dropdown font-xsmall"></li>').insertBefore($('.navbar-right .dropdown')[0])
                var b = $('.navbar-right .dropdown a:last')
                b.detach()
                a.append(b)

                $('.navbar-right .dropdown:last a:first').html('<span class="caret"/>')
            }
        });
    }

    spApp.config(function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://*.ala.org.au/**',
            'http://www.openstreetmap.org/**',
            'http://www.google.com/**',
            '${config.grails.serverURL}/**',
            '${config.biocache.url}/**',
            '${config.biocacheService.url}/**',
            '${config.bie.baseURL}/**',
            '${config.layersService.url}/**',
            '${config.lists.url}/**',
            '${config.sandbox.url}/**',
            '${config.sandboxService.url}/**',
            '${config.geoserver.url}/**',
            '${config.collections.url}/**'
        ]);
    });
    spApp.config(['$compileProvider',
        function ($compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|http|https):/);
        }]);


    $(window).on("resize", function () {
        $("#map").height($(window).height() - $('.navbar-header').height());
        $("#legend").height($(window).height() - $('.navbar-header').height() - 195);

    }).trigger("resize");



</r:script>

<g:render template="/configjs" plugin="sandbox-hub"/>

</body>

<head>

    <r:script>

        SpatialPortalConfig = {
            biocacheUrl: '${config.biocache.url}',
            biocacheServiceUrl: '${config.biocacheService.url}',
            bieUrl: '${config.bie.baseURL}',
            layersServiceUrl: '${config.layersService.url}',
            listsUrl: '${config.lists.url}',
            sandboxUrl: '${config.sandbox.url}',
            sandboxServiceUrl: '${config.sandboxService.url}',
            sandboxUiUrl: '${config.sandbox.uiUrl}',
            sandboxUrls: ['${config.sandbox.url}'],
            sandboxServiceUrls: ['${config.sandboxService.url}'],
            gazField: '${config.gazField}',
            geoserverUrl: '${config.geoserver.url}',
            collectionsUrl: '${config.collections.url}',
            userObjectsField: '${config.userObjectsField}',
            gazField: '${config.gazField}',
            userId: '${userId}',
            hoverLayers: [],
            proxyUrl: '${createLink(controller: 'portal', action: 'proxy')}',
            url: '${createLink(controller: 'portal', action: 'index')}',
            sessionId: '${sessionId}'
        }

        L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images'

        //call this after adding data to a fixed-head table
        $resizeTables = function() {
            var tables = $('table.fixed-head')
            $('table.fixed-head').each(function() {
                var widths = $(this).find('tbody tr:first').children().map( function (i, v) {
                    return $(this).width()
                }).get()

                $(this).find('thead tr').children().each(function(i, v) {
                    $(v).width(widths[i]);
                });
            })
        }

        $(window).resize(function() {
            $resizeTables()
        }).resize(); // Trigger resize handler
    </r:script>


    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <meta name="layout" content="portal"/>
    <title>Atlas of Living Australia | Spatial Portal</title>

    <r:require modules="portal, preview"></r:require>

</head>
</html>
