(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name selectFacet
     * @description
     *   Facet selection controls
     */
    angular.module('select-facet-directive', ['map-service', 'predefined-areas-service'])
        .directive('selectFacet', ['$http', 'MapService', 'PredefinedAreasService', '$timeout', 'FacetAutoCompleteService', 'BiocacheService',
            'LayoutService', function ($http, MapService, PredefinedAreasService, $timeout, FacetAutoCompleteService, BiocacheService, LayoutService) {

                return {
                    templateUrl: '/spApp/selectFacetCtrl.htm',
                    scope: {
                        _selectedFacet: '=selectedFacet',
                        _uniqueId: '=uniqueId'
                    },
                    link: function (scope, element, attrs) {

                        scope.facet = {};
                        scope.facets = [];
                        scope.facetList = [];
                        scope.exportUrl = null;


                        FacetAutoCompleteService.search(BiocacheService.newQuery(["-*:*"])).then(function (data) {
                            scope.facets = data
                        });

                        scope.pageSize = 10;
                        scope.offset = 0;
                        scope.max = 0;
                        scope.maxPages = 0;

                        scope.updatingPage = false;
                        scope.downloadSize = 0;

                        scope.facetFilter = '';

                        LayoutService.addToSave(scope);

                        scope.ok = function (data) {
                            if (scope.step === 2) {
                                scope.applySelection();
                                scope.updateSel();

                            } else {
                                scope.step = scope.step + 1
                            }
                        };

                        scope.nextPage = function () {
                            scope.applySelection();
                            if (scope.offset + scope.pageSize < scope.max) {
                                scope.offset += scope.pageSize;
                                scope.updatePage()
                            }
                        };

                        scope.previousPage = function () {
                            scope.applySelection();
                            if (scope.offset > 0) {
                                scope.offset -= scope.pageSize;
                                scope.updatePage()
                            }
                        };

                        scope.resetFacet = function () {
                            scope.offset = 0;
                            scope.clearSelection();
                            scope.updateFacet()
                        };

                        scope.clearFilter = function () {
                            scope.facetFilter = '';
                            scope.offset = 0;
                            scope.updatePage()
                        };


                        scope.updateFacet = function () {
                            scope.update(true);
                        };

                        scope.updatePage = function () {
                            scope.update(false);
                        };

                        scope.update = function (updateAll) {
                            scope.updatingPage = true;

                            var config = {
                                eventHandlers: {
                                    progress: function (c) {
                                        scope.downloadSize = c.loaded
                                    }
                                }
                            };

                            //console.log("---here----");
                            //console.log(scope);
                            //console.log($SH);
                            scope.applySelection();


                            /* var selArea = {
                                $$hashKey: "object:783",
                                area_km: 233.37,
                                bbox: "POLYGON((-2.96241408868993 52.7060215055078,-2.96241408868993 52.861075389035,-2.70653122381007 52.861075389035,-2.70653122381007 52.7060215055078,-2.96241408868993 52.7060215055078))",
                                name: "My circle",
                                pid: "21112",
                                uid: 1,
                                wkt: "MULTIPOLYGON (((-2.83447265625 52.861075389034994, -2.850566349346631 52.8604629788243, -2.8664048917450815 52.8586354576448, -2.8817372416035076 52.85562179747688, -2.896320504575346 52.851469766371075, -2.90992383347249 52.84624515987665, -2.922332123065662 52.840030743450214, -2.93334943832762 52.83292492379567, -2.942802119808399 52.82504017157788, -2.950541516242884 52.81650122199478, -2.9564463017416256 52.80744308321215, -2.9604243428021553 52.79800888560942, -2.9624140886899277 52.788347607110346, -2.9623854672677905 52.77861171155788, -2.9603402769035285 52.76895473812734, -2.9563120734771013 52.759528880162456, -2.950365559586022 52.75048259158403, -2.942595490678425 52.741958258188006, -2.933125119926298 52.734089969759054, -2.922104210111409 52.72700142701968, -2.9097066465852275 52.72080401506368, -2.89612769045661 52.71559507213842, -2.8815809155514738 52.711456379494344, -2.866294876386532 52.708452894567785, -2.850509557423913 52.7066317460534, -2.83447265625 52.70602150550779, -2.818435755076087 52.7066317460534, -2.802650436113468 52.708452894567785, -2.7873643969485262 52.711456379494344, -2.77281762204339 52.71559507213842, -2.7592386659147725 52.72080401506368, -2.746841102388591 52.72700142701968, -2.735820192573702 52.734089969759054, -2.726349821821575 52.741958258188006, -2.718579752913978 52.75048259158403, -2.7126332390228987 52.759528880162456, -2.7086050355964715 52.76895473812734, -2.7065598452322095 52.77861171155788, -2.7065312238100723 52.788347607110346, -2.7085209696978447 52.79800888560942, -2.7124990107583744 52.80744308321215, -2.718403796257116 52.81650122199478, -2.726143192691601 52.82504017157788, -2.73559587417238 52.83292492379567, -2.746613189434338 52.840030743450214, -2.75902147902751 52.84624515987665, -2.772624807924654 52.851469766371075, -2.7872080708964924 52.85562179747688, -2.8025404207549185 52.8586354576448, -2.818378963153369 52.8604629788243, -2.83447265625 52.861075389034994)))"
                            };
                            scope.layerAreas = [selArea];
                            scope._selectedArea = {
                                area: [selArea],
                                _uniqueId: 0
                            };
                            console.log(scope); */

                            var qid = ["*:*"];

                            //seem to be losing selectedArea
                            if ($SH.qc !== undefined && $SH.qc != null && $SH.qc.length > 0) qid = [$SH.qc]; // RR *** this should be set?
                            console.log("qid = " + qid);
                            var pageSize = 10;
                            var offset = scope.offset;
                            BiocacheService.facetGeneral(scope.facet, {
                                qid: qid,
                                bs: $SH.biocacheServiceUrl
                            }, pageSize, offset, scope.facetFilter, config).then(function (data) {
                                if (data.length > 0) {
                                    scope.facetList = data[0].fieldResult;
                                    scope.exportUrl = BiocacheService.facetDownload(scope.facet);
                                    scope.max = data[0].count;
                                    scope.maxPages = Math.ceil(scope.max / scope.pageSize)
                                } else {
                                    scope.max = 0;
                                    scope.facetList = [];
                                    scope.maxPages = 0
                                }
                                scope.updateSel();
                                scope.updateCheckmarks();

                                scope.updatingPage = false;
                            })
                        };

                        scope.clearSelection = function () {
                            for (var i = 0; i < scope.facetList.length; i++) {
                                scope.facetList[i].selected = false
                            }
                            scope.selection = [];
                            scope.updateSel()
                        };

                        scope.applySelection = function () {
                            for (var i = 0; i < scope.facetList.length; i++) {
                                if (scope.facetList[i].selected) {
                                    var found = false;
                                    for (var k in scope.selection) {
                                        if (scope.selection[k].fq === scope.facetList[i].fq) {
                                            found = true
                                        }
                                    }
                                    if (!found) scope.selection.push(scope.facetList[i])
                                } else {
                                    for (k in scope.selection) {
                                        if (scope.selection[k].fq === scope.facetList[i].fq) {
                                            scope.selection.splice(Number(k), 1)
                                        }
                                    }
                                }
                            }

                            scope.updateSel()
                        };

                        scope.updateCheckmarks = function () {
                            for (var i = 0; i < scope.facetList.length; i++) {
                                var found = false;
                                for (var k in scope.selection) {
                                    if (scope.selection[k].fq === scope.facetList[i].fq) {
                                        found = true
                                    }
                                }
                                if (found) scope.facetList[i].selected = true
                            }
                        };

                        scope.updateSel = function () {
                            var sel = '';
                            var invert = false;
                            var count = 0;
                            for (var i = 0; i < scope.selection.length; i++) {
                                var fq = scope.selection[i].fq;
                                if (fq.match(/^-/g) != null && (fq.match(/:\*$/g) != null || fq.match(/\[\* TO \*\]$/g) != null)) {
                                    invert = true
                                }
                                count++
                            }
                            if (count === 1) invert = false;
                            for (i = 0; i < scope.selection.length; i++) {
                                fq = scope.selection[i].fq;

                                if (invert) {
                                    if (sel.length > 0) sel += " AND ";
                                    if (fq.match(/^-/g) != null && (fq.match(/:\*$/g) != null || fq.match(/\[\* TO \*\]$/g) != null)) {
                                        sel += fq.substring(1)
                                    } else {
                                        sel += '-' + fq
                                    }
                                } else {
                                    if (sel.length > 0) sel += " OR ";
                                    sel += fq
                                }
                            }
                            if (invert) {
                                sel = '-(' + sel + ')'
                            }

                            if (sel.length === 0) {
                                scope._selectedFacet = ''
                            } else {
                                scope._selectedFacet = sel
                            }
                        }
                    }
                }

            }])
}(angular));
