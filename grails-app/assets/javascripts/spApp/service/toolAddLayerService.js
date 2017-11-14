(function (angular) {
    'use strict';
    angular.module('tool-add-layer-service', [])
        .factory("ToolAddLayerService", ["$http", "$q", "MapService", "LayersService", function ($http, $q, MapService, LayersService) {
            return {
                spec: {
                    "input": [
                        {
                            "description": "Select layers.",
                            "type": "layer",
                            "constraints": {
                                "min": 1,
                                "optional": false
                            }
                        }],
                        "description": "Add environmental and contextual layers to the map."
                    },

                execute: function (inputs) {
                    var promises = [];
                    for (var i = 0; i < inputs[0].length; i++) {
                        promises.push(MapService.add(LayersService.convertFieldIdToMapLayer(inputs[0][i])))
                    }
                    return $q.all(promises)
                }
            };
        }])
}(angular));
