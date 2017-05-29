(function (angular) {
    'use strict';
    angular.module('select-layers-directive', ['lists-service', 'layer-distances-service', 'map-service',
        'predefined-layer-lists-service'])
        .directive('selectLayers', ['$http', '$timeout', 'LayersService', 'LayerDistancesService', 'MapService',
            'LayoutService', 'PredefinedLayerListsService',
            function ($http, $timeout, LayersService, LayerDistancesService, MapService,
                      LayoutService, PredefinedLayerListsService) {

                var sortType = 'classification'; // set the default sort type
                var sortReverse = false;  // set the default sort order
                var searchLayer = '';    // set the default search/filter term
                return {
                    templateUrl: '/spApp/selectLayersCtrl.htm',
                    scope: {
                        _selection: "=selectedLayers",
                        _minCount: "=minCount",
                        _maxCount: "=maxCount",
                        _mandatory: "=mandatory",
                        _uniqueId: '=uniqueId'
                    },
                    link: function (scope, element, attrs) {

                        scope.exportUrl = null;
                        scope.validLayerSelection = scope._mandatory === undefined || !scope._mandatory;
                        scope.mode = '';
                        LayoutService.addToSave(scope);

                        scope.layersServiceUrl = $SH.layersServiceUrl;

                        scope.layers = [];
                        scope.predefinedLists = PredefinedLayerListsService.getList();

                        scope.upload = function () {
                            var f = element.children()[0].files[0], r = new FileReader();
                            r.onloadend = function (e) {
                                scope.data = e.target.result;

                                $timeout(function () {
                                    scope.custom()(scope.data)
                                }, 0)
                            };
                            r.readAsBinaryString(f);
                        };

                        scope.changeSelectedItem = function (newMode) {
                            if (newMode === 'uploadLayers') {
                                scope.mode = newMode

                            } else if (newMode === 'pasteLayers') {
                                scope.mode = newMode

                            } else if (newMode === '') {
                                scope.mode = newMode

                            } else {
                                scope.mode = '';
                                scope.addList(newMode)
                            }
                        };

                        scope.clearSelection = function () {
                            for (var i = 0; i < scope._selection.layers.length; i++) {
                                scope._selection.layers[i].selected = false
                            }
                            while (scope._selection.layers.length) {
                                scope._selection.layers.pop()
                            }
                        };

                        scope.setLayers = function (data) {
                            for (var i = 0; i < data.length; i++) {
                                scope.layers.push({
                                    id: data[i].id,
                                    classification1: data[i].layer.classification1,
                                    classification2: data[i].layer.classification2,
                                    classification: data[i].layer.classification1 + ' / ' + data[i].layer.classification2,
                                    name: data[i].name,
                                    type: data[i].type,
                                    dist: 2,
                                    selected: scope.isSelected(data[i].id),
                                    layerId: data[i].layer.id,
                                    bbox: [[data[i].layer.minlatitude, data[i].layer.minlongitude], [data[i].layer.maxlatitude, data[i].layer.maxlongitude]]
                                })
                            }
                        };

                        scope.addToMap = function () {
                            for (var i in scope._selection) {
                                if (scope._selection.hasOwnProperty(i)) {
                                    MapService.add(scope._selection[i]);
                                }
                            }
                        };

                        LayersService.getLayers().then(function (data) {
                            scope.setLayers(data.data);

                            $timeout(function () {
                                $resizeTables()
                            }, 200)
                        });

                        scope.$watch('layers', function () {
                            $timeout(function () {
                                $resizeTables()
                            }, 200)
                        });

                        scope.$watch('searchLayer', function () {
                            $timeout(function () {
                                $resizeTables()
                            }, 200)
                        });

                        scope.isSelected = function (id) {
                            for (var i = 0; i < scope._selection.layers.length; i++) {
                                if (scope._selection.layers[i].id === id) {
                                    return true
                                }
                            }
                            return false
                        };

                        scope.getLayer = function (layer) {
                            for (var i = 0; i < scope.layers.length; i++) {
                                if (scope.layers[i].id === layer) {
                                    return scope.layers[i];
                                }
                            }
                        };

                        scope.addList = function (list) {
                            var items = [];
                            if (list.isArray) {
                                items = list;
                            } else {
                                items = list.replace(/,|\n|;|\t/gi, ' ').split(' ');
                            }
                            for (var i in items) {
                                var layer = scope.getLayer(items[i]);

                                if (layer && layer.id && !layer.selected) {
                                    layer.selected = true;
                                    scope._selection.layers.push(layer)
                                }
                            }
                            if (items.length > 0) scope.updateDist();
                            scope.updateExportSet()

                        };

                        scope.updateExportSet = function () {
                            if (scope._mandatory === undefined || !scope._mandatory) {
                                scope.validLayerSelection = true
                            } else scope.validLayerSelection = scope._selection !== undefined &&
                                scope._selection.layers !== undefined &&
                                scope._selection.layers.length >= scope._minCount &&
                                scope._selection.layers.length <= scope._maxCount;
                            if (scope._selection !== undefined && scope._selection.layers !== undefined) {
                                var data = '';
                                for (var i = 0; i < scope._selection.layers.length; i++) {
                                    if (i > 0) data += ',';
                                    data += scope._selection.layers[i].id
                                }
                                if (data.length > 0) {
                                    var blob = new Blob([data], {type: 'text/plain'});
                                    scope.exportUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                                } else {
                                    scope.exportUrl = null
                                }
                            }
                        };

                        scope.add = function (layerItem) {
                            var layer = scope.getLayer(!layerItem.id ? layerItem : layerItem.id);

                            if (layer && layer.id && !layer.selected) {
                                layer.selected = true;
                                scope._selection.layers.push(layer);
                                scope.updateDist();

                                scope.updateExportSet()
                            }
                        };

                        scope.info = function (item) {
                            LayoutService.openIframe(LayersService.url() + '/layer/more/' + item.layerId, '', '')
                        };

                        scope.removeAll = function () {
                            for (var i = 0; i < scope.layers.length; i++) {
                                scope.layers[i].selected = false
                            }
                            scope.updateDist();
                            scope.updateExportSet()
                        };

                        scope.remove = function (layerItem) {
                            var layer = scope.getLayer(!layerItem.id ? layerItem : layerItem.id);

                            layer.selected = false;
                            for (var i = 0; i < scope._selection.layers.length; i++) {
                                if (scope._selection.layers[i].id === layer.id) {
                                    scope._selection.layers.splice(i, 1);
                                    scope.updateDist()
                                }
                            }
                            scope.updateExportSet()
                        };

                        scope.toggle = function (layer) {
                            if (layer.selected) {
                                scope.remove(layer)
                            } else {
                                scope.add(layer)
                            }
                            scope.updateExportSet()
                        };

                        scope.updateDist = function () {
                            var distances = [];
                            for (var i = 0; i < scope.layers.length; i++) {
                                var distance = 2;
                                var id = scope.layers[i].id;
                                for (var j = 0; j < scope._selection.layers.length; j++) {
                                    if (scope._selection.layers[j].id === id) {
                                        distance = 0;
                                        break;
                                    }
                                    var newDist = LayerDistancesService.getDistance(id, scope._selection.layers[j].id);
                                    if (newDist < distance) distance = newDist
                                }
                                distances[i] = distance
                            }
                            for (i = 0; i < scope.layers.length; i++) {
                                scope.layers[i].dist = distances[i]
                            }
                        }
                    }
                }


            }])
}(angular));

