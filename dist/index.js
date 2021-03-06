/**
 * geolocation.js v0.0.66
 * (c) 2017 yuronghui
 * @license MIT
 */
"use strict";

var _createClass$1 = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

var _templateObject$1 = _taggedTemplateLiteral$1([ '\n        <div class="map-div">\n            <div id="map_container"></div>\n            <search id=\'input_', "'></search>\n        </div>" ], [ '\n        <div class="map-div">\n            <div id="map_container"></div>\n            <search id=\'input_', "'></search>\n        </div>" ]);

function _taggedTemplateLiteral$1(strings, raw) {
    return Object.freeze(Object.defineProperties(strings, {
        raw: {
            value: Object.freeze(raw)
        }
    }));
}

function _classCallCheck$1(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn$1(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits$1(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var View = function(_Lego$UI$Baseview) {
    _inherits$1(View, _Lego$UI$Baseview);
    function View() {
        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        _classCallCheck$1(this, View);
        var options = {
            mapApi: Lego.config.mapApi,
            placeholder: "搜索地址",
            data: {}
        };
        Object.assign(options, opts);
        return _possibleConstructorReturn$1(this, (View.__proto__ || Object.getPrototypeOf(View)).call(this, options));
    }
    _createClass$1(View, [ {
        key: "getLocationByAddress",
        value: function getLocationByAddress(str) {
            var opts = this.options, that = this;
            if (this.geocoder) {
                this.geocoder.getLocation(str, function(status, result) {
                    if (status == "complete" && result.geocodes.length) {
                        that.marker.setPosition(result.geocodes[0].location);
                        var point = that.marker.getPosition();
                        that.map.setCenter(point);
                        that.map.getCity(function(data) {
                            opts.context.result = {
                                address: str,
                                province: data["province"],
                                city: data["city"],
                                area: data["district"],
                                lng: point.lng,
                                lat: point.lat
                            };
                        });
                    }
                });
            }
        }
    }, {
        key: "components",
        value: function components() {
            var opts = this.options, that = this;
            opts.context.result = opts.data;
            this.addCom({
                el: "#input_" + opts.vid,
                placeholder: opts.placeholder,
                style: {
                    position: "absolute",
                    top: -46,
                    left: 160,
                    width: 350
                },
                onSearch: function onSearch(self, obj) {
                    that.getLocationByAddress(obj.keyword);
                }
            });
        }
    }, {
        key: "render",
        value: function render() {
            var opts = this.options;
            return hx(_templateObject$1, opts.vid);
        }
    }, {
        key: "renderAfter",
        value: function renderAfter() {
            var opts = this.options, that = this;
            this.map = new AMap.Map("map_container", {
                resizeEnable: true,
                zoom: 14
            });
            AMap.plugin([ "AMap.Autocomplete", "AMap.PlaceSearch" ], function() {
                var autoOptions = {
                    input: that.$(".lego-search-input")[0]
                };
                var autocomplete = new AMap.Autocomplete(autoOptions);
                var placeSearch = new AMap.PlaceSearch({
                    map: that.map
                });
                AMap.event.addListener(autocomplete, "select", function(e) {
                    placeSearch.search(e.poi.name);
                });
            });
            if (opts.data) {
                that.map.getCity(function(data) {
                    opts.data.city = data["city"];
                    that.renderMap(opts.data);
                });
            } else {
                var _onComplete = function _onComplete(result) {
                    that.map.getCity(function(data) {
                        that.renderMap({
                            city: data["city"],
                            lng: result.position.getLng(),
                            lat: result.position.getLat()
                        });
                    });
                };
                var _onError = function _onError(data) {
                    debug.warn(data);
                };
                this.map.plugin("AMap.Geolocation", function() {
                    geolocation = new AMap.Geolocation({
                        enableHighAccuracy: true,
                        timeout: 1e4,
                        buttonOffset: new AMap.Pixel(10, 20),
                        zoomToAccuracy: true,
                        buttonPosition: "RB"
                    });
                    that.map.addControl(geolocation);
                    geolocation.getCurrentPosition();
                    AMap.event.addListener(geolocation, "complete", _onComplete);
                    AMap.event.addListener(geolocation, "error", _onError);
                });
            }
        }
    }, {
        key: "renderMap",
        value: function renderMap() {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var that = this, opts = this.options;
            if (opts.mapApi) {
                AMap.plugin("AMap.Geocoder", function() {
                    that.geocoder = new AMap.Geocoder();
                    that.marker = new AMap.Marker({
                        map: that.map,
                        bubble: true
                    });
                    if (data.address) {
                        that.getLocationByAddress(data.address);
                    } else {
                        if (data.lng && data.lat) {
                            that.marker.setPosition([ data.lng, data.lat ]);
                            var point = that.marker.getPosition();
                            that.map.setCenter(point);
                        }
                    }
                    that.map.on("click", function(e) {
                        that.marker.setPosition(e.lnglat);
                        that.geocoder.getAddress(e.lnglat, function(status, result) {
                            if (status == "complete") {
                                var inputView = Lego.getView("#input_" + opts.vid);
                                var address = inputView.options.value = result.regeocode.formattedAddress;
                                that.map.getCity(function(data) {
                                    opts.context.result = {
                                        address: address,
                                        province: data["province"],
                                        city: data["city"],
                                        area: data["district"],
                                        lng: e.lnglat.lng,
                                        lat: e.lnglat.lat
                                    };
                                });
                            }
                        });
                    });
                });
            }
        }
    } ]);
    return View;
}(Lego.UI.Baseview);

Lego.components("lego-maps", View);

var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

var _templateObject = _taggedTemplateLiteral([ '<i class="anticon anticon-environment-o"></i>' ], [ '<i class="anticon anticon-environment-o"></i>' ]);

var _templateObject2 = _taggedTemplateLiteral([ '\n        <div class="lego-geolocation">\n            <input type="hidden" name="hidden_', '" id="lnglat_', '" value="', '">\n            <inputs id="inputs_', '"></inputs>\n            ', "\n        </div>\n        " ], [ '\n        <div class="lego-geolocation">\n            <input type="hidden" name="hidden_', '" id="lnglat_', '" value="', '">\n            <inputs id="inputs_', '"></inputs>\n            ', "\n        </div>\n        " ]);

var _templateObject3 = _taggedTemplateLiteral([ '<div class="lego-smallmap" id="locationMap_', '" style="height: 250px;', '"></div>' ], [ '<div class="lego-smallmap" id="locationMap_', '" style="height: 250px;', '"></div>' ]);

var _templateObject4 = _taggedTemplateLiteral([ '<lego-maps id="maps_', '"></lego-maps>' ], [ '<lego-maps id="maps_', '"></lego-maps>' ]);

function _taggedTemplateLiteral(strings, raw) {
    return Object.freeze(Object.defineProperties(strings, {
        raw: {
            value: Object.freeze(raw)
        }
    }));
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var ComView = function(_Lego$UI$Baseview) {
    _inherits(ComView, _Lego$UI$Baseview);
    function ComView() {
        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        _classCallCheck(this, ComView);
        var options = {
            name: "",
            mapApi: Lego.config.mapApi,
            showInput: true,
            readonly: false,
            locationMap: false,
            showToolBar: false,
            placeholder: "请标注地理位置",
            data: {},
            value: {},
            onChange: function onChange() {}
        };
        Object.assign(options, opts);
        if (options.value) {
            options.data = typeof options.value == "function" ? val(options.value) : options.value;
        }
        var _this = _possibleConstructorReturn(this, (ComView.__proto__ || Object.getPrototypeOf(ComView)).call(this, options));
        var that = _this, option = _this.options;
        Lego.loadScript(option.mapApi, function() {
            setTimeout(function() {
                if (option.locationMap && option.data.lng && option.data.lat) that.showLocationMap(option.data);
            }, 200);
        }, "amap");
        return _this;
    }
    _createClass(ComView, [ {
        key: "components",
        value: function components() {
            var opts = this.options, that = this;
            if (opts.showInput) {
                this.addCom({
                    el: "#inputs_" + opts.vid,
                    name: opts.name,
                    disabled: opts.disabled,
                    readonly: opts.readonly,
                    placeholder: opts.placeholder,
                    size: opts.size,
                    value: opts.data.address || "",
                    nextAddon: hx(_templateObject),
                    onChange: function onChange(self, value, event) {
                        if (typeof opts.onChange == "function") opts.onChange(that, value);
                    }
                });
            }
        }
    }, {
        key: "render",
        value: function render() {
            var opts = this.options;
            var vDom = hx(_templateObject2, opts.name, opts.vid, [ opts.data.lng, opts.data.lat ].join(","), opts.vid, opts.locationMap ? hx(_templateObject3, opts.vid, !opts.readonly || !opts.data.lng || !opts.data.lat ? "display:none;" : "") : "");
            return vDom;
        }
    }, {
        key: "renderAfter",
        value: function renderAfter() {
            var opts = this.options, that = this;
            this.$(".input-group-addon").off().on("click", function(event) {
                Lego.UI.modal({
                    type: "modal",
                    title: "地图选址",
                    content: hx(_templateObject4, opts.vid),
                    isMiddle: true,
                    width: 700,
                    height: 400,
                    className: "map-modal",
                    scrollbar: null,
                    components: [ {
                        el: "#maps_" + opts.vid,
                        mapApi: opts.mapApi,
                        data: function data() {
                            return opts.data;
                        }
                    } ],
                    onOk: function onOk(self) {
                        opts.data = self.result || {};
                        self.close();
                        that.updateValue();
                        that.showLocationMap(opts.data);
                        setTimeout(function() {
                            that.$("input[name=" + opts.name + "]").valid();
                            if (typeof opts.onChange == "function") opts.onChange(that, opts.data);
                        }, 200);
                    }
                });
            });
            this.updateValue();
            if (opts.locationMap) {
                var locationMapEl = this.$("#locationMap_" + opts.vid);
                if (locationMapEl.length) {
                    locationMapEl.css({
                        width: opts.locationMap.width,
                        height: opts.locationMap.height
                    });
                }
            }
        }
    }, {
        key: "showLocationMap",
        value: function showLocationMap() {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var opts = this.options;
            if (opts.locationMap) {
                this.$("#locationMap_" + opts.vid).show();
                var mapOpts = {
                    resizeEnable: true,
                    zoom: 14,
                    center: []
                };
                mapOpts.center[0] = data.lng || opts.locationMap.lng;
                mapOpts.center[1] = data.lat || opts.locationMap.lat;
                var map = new AMap.Map("locationMap_" + opts.vid, mapOpts);
                if (opts.showToolBar) {
                    map.plugin([ "AMap.ToolBar" ], function() {
                        map.addControl(new AMap.ToolBar());
                    });
                }
                var marker = new AMap.Marker({
                    position: mapOpts.center,
                    map: map
                });
            }
        }
    }, {
        key: "updateValue",
        value: function updateValue() {
            var opts = this.options;
            if (opts.data) {
                var input = this.$("#inputs_" + opts.vid).children("input"), lnglatInput = this.$("#lnglat_" + opts.vid);
                if (input.length) input.val(opts.data.address || "");
                if (lnglatInput.length) lnglatInput.val([ opts.data.lng, opts.data.lat ].join(",") || "");
            }
        }
    } ]);
    return ComView;
}(Lego.UI.Baseview);

Lego.components("geolocation", ComView);

module.exports = ComView;
