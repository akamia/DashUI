/*
hqWidgets is a �high quality� home automation widgets library.
You can easy create the user interface for home automation with the help of this library using HTML, javascript and CSS.
 
The library supports desktop and mobile browsers versions.
Actually library has following widgets:
- On/Off Button � To present and/or control some switch (e.g. Lamp)
- Dimmer � To present and control dimmer
- Window blind � to present and control one blind and display up to 4 window leafs
- Indoor temperature � to display indoor temperature and humidity with desired temperature and valve state
- Outdoor temperature � to display outdoor temperature and humidity
- Door   � to present a door
- Lock   � to present and control lock
- Image  � to show a static image
- Text   � to show a static text with different colors and font styles
- Info   � To display some information. Supports format string, condition for active state and different icons for active and static state.
 
------ Version V0.1 ------
 
 
----
Used software and icons:
* jQuery http://jquery.com/
* jQuery UI http://jqueryui.com/
* door bell by Lorc http://lorcblog.blogspot.de/
 
 
Copyright (c) 2013 Denis Khaev deniskhaev@gmail.com
 
It is licensed under the Creative Commons Attribution-Non Commercial-Share Alike 3.0 license.
The full text of the license you can get at http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode
 
Short content:
Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
Licensees may distribute derivative works only under a license identical to the license that governs the original work.
Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
(Free for non-commercial use).
*/

// Main object and container
hqWidgets = $.extend (true, hqWidgets, {
    // Creates in the parent table lines with settings
    hqEditButton: function (options, obj, additionalSettingsFunction) {
        var e_settings = {
            parent:      null,
            elemName:    'inspect',
            width:       200,
            imgSelect:   null,   // image selection dialog
            timeout:     500,    // object update timeout
            clrSelect:   null,   // color selection dialog
            styleSelect: null,   // style selection dialog
        };
        var e_internal = {
            attr:            null,
            controlRadius:   null,
            obj:             null,
            iconChanged:     null, //function
            inactiveChanged: null,
            timer:           null,
            textChanged:     null,
            textFontChanged: null,
            textColorChanged:null,
            infoChanged:     null,
            infoFontChanged: null,
            infoColorChanged:null,
            parent:          null,
            state:           hqWidgets.gState.gStateOff, // Simulate state
            extra:           null,
        };
        this.e_settings = $.extend (e_settings, options);
        
        if (this.e_settings.parent == null)
            return;
            
        this.e_internal        = e_internal;
        this.e_internal.attr   = obj.GetSettings ();
        this.e_internal.obj    = obj;
        this.e_internal.parent = this;
        this.e_internal.extra  = additionalSettingsFunction;
        
        // clear all
        this.e_settings.parent.html("");
        
        var sText       = "";
        var sTextAdv    = "";
        var sTextStyle  = "";
        var iAdvCount   = 0;
        var iStyleCount = 0;
        
        this._EditTextHandler = function (eee, filter, isStates) {
            var elem;
            if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee)) != null) {
                elem.parent   = this;
                elem.ctrlAttr = eee;
                elem.filter   = (filter === undefined) ? null : filter;
                elem.isStates = isStates;
                var jeee = $('#'+this.e_settings.elemName+'_'+eee).change (function () {
                    // If really changed
                    var settings    = this.parent.e_internal.attr;
                    var name        = this.ctrlAttr;
                    var newSettings = {};
                    var nSettings   = newSettings;
                    
                    if (name.indexOf ("_") != -1) {
                        var t = name.split('_');
                        var i = 0;
                        nSettings = newSettings;
                        while (i < t.length - 1) {
                            settings = settings[t[i]];
                            nSettings[t[i]] = {};
                            nSettings = nSettings[t[i]];
                            i++;
                        }
                        name = t[t.length-1];
                    }
                    
                    if (!elem.isStates) {
                        if (settings[name] != $(this).val()) {
                            settings[name] = $(this).val();
                            
                            if (settings[name] == "")
                                settings[name] = null;
                            
                            if (name == 'openDoorBttnText') {            
                                settings['openDoorBttn'] = (settings[name] != null);
                                newSettings['openDoorBttn'] = settings['openDoorBttn'];
                            }
                            
                            nSettings[name] = settings[name];
                            this.parent.e_internal.obj.SetSettings (newSettings, true);
                        }
                    }
                    else {
                        if (this.parent.e_internal.obj.dynStates[this.ctrlAttr] != $(this).val()) {
                            this.parent.e_internal.obj.dynStates[this.ctrlAttr] = $(this).val();
                            
                            if (this.parent.e_internal.obj.dynStates[this.ctrlAttr] == "")
                                this.parent.e_internal.obj.dynStates[this.ctrlAttr] = null;
                            
                            var newSettings = {};
                            newSettings[this.ctrlAttr] = this.parent.e_internal.obj.dynStates[this.ctrlAttr];
                            this.parent.e_internal.obj.SetStates (newSettings, true);
                        }
                    }
                });

                jeee.keyup (function () {
                    if (this.parent.e_internal.timer) 
                        clearTimeout (this.parent.e_internal.timer);
                        
                    this.parent.e_internal.timer = setTimeout (function(elem_) {
                        $(elem_).trigger('change');
                        elem_.parent.e_internal.timer=null;
                    }, this.parent.e_settings.timeout, this);
                });            
                if (this.e_settings.imgSelect)
                {
                    var btn = document.getElementById (this.e_settings.elemName+'_'+eee+'Btn');
                    if (btn) {
                        btn.ctrlAttr = eee;
                        btn.filter   = document.getElementById (this.e_settings.elemName+'_'+eee).filter;
                        $(btn).bind("click", {msg: this}, function (event) {
                            var _obj = event.data.msg;
                            var _settings = {
                                current:     _obj.e_internal.attr[this.ctrlAttr],
                                onselectArg: this.ctrlAttr,
                                filter:      (this.filter == null) ? ".png;.gif;.jpg;.bmp" : this.filter,
                                onselect:    function (img, ctrlAttr) {
                                    $('#'+_obj.e_settings.elemName+'_'+ctrlAttr).val(_obj.e_settings.imgSelect.GetFileName(img, hqWidgets.gOptions.gPictDir)).trigger("change");
                                }};
                            _obj.e_settings.imgSelect.Show (_settings);                    
                        });
                    }
                }
            }	
        }
        this._EditCheckboxHandler = function (eee, isStates, valFalse, valTrue, onChange) {
            var elem;
            if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee)) != null) {
                elem.parent   = this;
                elem.ctrlAttr = eee;
                elem.isStates = (isStates == undefined) ? true : isStates;
                elem.valFalse = (valFalse == undefined) ? hqWidgets.gState.gStateOff : valFalse;
                elem.valTrue  = (valTrue  == undefined) ? hqWidgets.gState.gStateOn  : valTrue;
                elem.onChange = onChange;
                
                $('#'+this.e_settings.elemName+'_'+eee).change (function () { 
                    this.parent.e_internal.attr[this.ctrlAttr] = $(this).prop('checked') ? this.valTrue : this.valFalse;
                    var newSettings = {};
                    newSettings[this.ctrlAttr] = this.parent.e_internal.attr[this.ctrlAttr];
                    
                    if (this.isStates)
                        this.parent.e_internal.obj.SetStates (newSettings);
                    else
                        this.parent.e_internal.obj.SetSettings (newSettings, true);
                    
                    if (this.onChange)
                        this.onChange (this.parent.e_internal.attr[this.ctrlAttr], this.parent);
                });
            }        
        }
        this._EditColorHandler = function (eee) {
            var elem;
            if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee)) != null) {
                elem.parent   = this;
                elem.ctrlAttr = eee;
                var jeee = $('#'+this.e_settings.elemName+'_'+eee).change (function () {
                    // If really changed                  
                    if (this.parent.e_internal.attr[this.ctrlAttr] != $(this).val()) {
                        this.parent.e_internal.attr[this.ctrlAttr] = $(this).val();
                        
                        if (this.parent.e_internal.attr[this.ctrlAttr] == "")
                            this.parent.e_internal.attr[this.ctrlAttr] = null;
                        
                        var newSettings = {};
                        newSettings[this.ctrlAttr] = this.parent.e_internal.attr[this.ctrlAttr];
                        this.parent.e_internal.obj.SetSettings (newSettings, true);
                    }
                });

                jeee.keyup (function () {
                    if (this.parent.e_internal.timer) 
                        clearTimeout (this.parent.e_internal.timer);
                        
                    this.parent.e_internal.timer = setTimeout (function(elem_) {
                        $(elem_).trigger('change');
                        elem_.parent.e_internal.timer=null;
                    }, this.parent.e_settings.timeout, this);
                });            
                if (this.e_settings.clrSelect) {
                    var btn = document.getElementById (this.e_settings.elemName+'_'+eee+'Btn');
                    if (btn) {
                        btn.ctrlAttr = eee;
                        btn.elemName = this.e_settings.elemName;
                        $(btn).bind("click", {msg: this}, function (event) {
                            var _obj = event.data.msg;
                            var _settings = {
                                current:     _obj.e_internal.attr[this.ctrlAttr],
                                onselectArg: this.ctrlAttr,
                                onselect:    function (img, ctrlAttr) {
                                    $('#'+_obj.e_settings.elemName+'_'+ctrlAttr).val(_obj.e_settings.clrSelect.GetColor()).trigger("change");
                                }};
                            _obj.e_settings.clrSelect.Show (_settings);                    
                        });
                    }
                }
            }	
        }
        this._EditStyleHandler = function (eee, filterFile, filterName, filterAttrs) {
            var elem;
            if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee+'Parent')) != null) {
                elem.parent   = this;
                elem.ctrlAttr = eee;
                hqStyleSelector.Show ({ width: 202,
                    name:          this.e_settings.elemName+'_'+eee,
                    style:         this.e_internal.attr[elem.ctrlAttr],     
                    parent:        $('#'+this.e_settings.elemName+'_'+eee+'Parent'),
                    filterFile:    filterFile,
                    filterName:    filterName,
                    filterAttrs:   filterAttrs,
                    onchangeParam: elem,
                    onchange: function (newStyle, obj) {
                        // If really changed                  
                        if (obj.parent.e_internal.attr[obj.ctrlAttr] != newStyle) {
                            obj.parent.e_internal.attr[obj.ctrlAttr] = newStyle;
                            
                            if (obj.parent.e_internal.attr[obj.ctrlAttr] == "")
                                obj.parent.e_internal.attr[obj.ctrlAttr] = null;
                            
                            var newSettings = {};
                            newSettings[obj.ctrlAttr] = obj.parent.e_internal.attr[obj.ctrlAttr];
                            obj.parent.e_internal.obj.SetSettings (newSettings, true);
                        }
                    },
                });      
            }	
        }
        
        // Active/Inactive state
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind  &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam    && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge) {
            sText += "<tr><td>"+ hqWidgets.Translate("Test state:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_state'>";
        }
        
        // Simulate click
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam  ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            sText += "<tr><td></td><td><input type='button' value='"+hqWidgets.Translate("Simulate click")+"' id='"+this.e_settings.elemName+"_popUp'>";
        }
        
        // Radius and Is Use jQuery Style
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLock  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Radius:")+"</td><td id='"+this.e_settings.elemName+"_radius'></td></tr>";
            if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge)
                sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("jQuery Styles:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_usejQueryStyle' "+((this.e_internal.attr.usejQueryStyle) ? "checked" : "")+">";
        }

        // Door swing type
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeDoor) {
            sText += "<tr><td>"+ hqWidgets.Translate("Slide:")+"</td><td><select style='width: "+this.e_settings.width+"px'  id='"+this.e_settings.elemName+"_door'>";
            sText += "<option value='"+hqWidgets.gSwingType.gSwingLeft +"' "+((this.e_internal.attr.doorType == hqWidgets.gSwingType.gSwingLeft)  ? "selected" : "") +">"+hqWidgets.Translate("Left")+"</option>";
            sText += "<option value='"+hqWidgets.gSwingType.gSwingRight+"' "+((this.e_internal.attr.doorType == hqWidgets.gSwingType.gSwingRight) ? "selected" : "") +">"+hqWidgets.Translate("Right")+"</option>";
            sText += "</select></td></tr>";
        }
        
        // Blind window types
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeBlind) {
            var wnd = this.e_internal.attr.windowConfig;
            var a = wnd.split(',');
            
            sText += "<tr><td>"+ hqWidgets.Translate("Slide&nbsp;count:")+"</td><td><select style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_wndCount'>";
            sText += "<option value='1' "+((a.length==1) ? "selected" : "") +">1</option>";
            sText += "<option value='2' "+((a.length==2) ? "selected" : "") +">2</option>";
            sText += "<option value='3' "+((a.length==3) ? "selected" : "") +">3</option>";
            sText += "<option value='4' "+((a.length==4) ? "selected" : "") +">4</option>";
            sText += "</select></td></tr>";
            
            var i;
            for (i =0 ; i < a.length; i++)
            {
                sText += "<tr><td>"+ hqWidgets.Translate("Slide&nbsp;type:")+"</td><td><select style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_wnd"+i+"'>";
                sText += "<option value='"+hqWidgets.gSwingType.gSwingDeaf +"' " +((a[i] == hqWidgets.gSwingType.gSwingDeaf)  ? "selected" : "") +">"+hqWidgets.Translate("Not opened")+"</option>";
                sText += "<option value='"+hqWidgets.gSwingType.gSwingLeft +"' " +((a[i] == hqWidgets.gSwingType.gSwingLeft)  ? "selected" : "") +">"+hqWidgets.Translate("Left")+"</option>";
                sText += "<option value='"+hqWidgets.gSwingType.gSwingRight+"' " +((a[i] == hqWidgets.gSwingType.gSwingRight) ? "selected" : "") +">"+hqWidgets.Translate("Right")+"</option>";
                sText += "</select></td></tr>";
            }
        }
        
        // Normal icon image
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge) {
            sText += "<tr><td>"+ hqWidgets.Translate("Icon:")+"</td><td>";
            sText += "<input id='"+this.e_settings.elemName+"_iconName' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.iconName==undefined) ? "" : this.e_internal.attr.iconName)+"'>";
            sText += "<input id='"+this.e_settings.elemName+"_iconNameBtn' style='width: 30px' type='button' value='...'>";
            sText += "</td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Icon width:")+"</td><td id='"+this.e_settings.elemName+"_btIconWidth'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Icon height:")+"</td><td id='"+this.e_settings.elemName+"_btIconHeight'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Icon size:")+"</td><td><input id='"+this.e_settings.elemName+"_iconAutoBtn' type='button' value='Auto'></td></tr>";
        }
        
        // Info Text color, font, type
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLock   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDimmer && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeButton &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam    && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGong) {
            if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge)
                sText    += "<tr><td>"+ hqWidgets.Translate("Test text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoText'  type='text' value='"+(this.e_internal.obj.dynStates.infoText || "")+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Font:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoTextFont'  type='text' value='"+this.e_internal.attr.infoTextFont+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Text color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoTextColor' type='text' value='"+this.e_internal.attr.infoTextColor+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_infoTextColorBtn' style='width: 30px' type='button' value='...'></td></tr>";
        }
        
        // Gauge min value, max value, test value, gague color
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGauge) {
            sText    += "<tr><td>"+ hqWidgets.Translate("Test value:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_valueSet'  type='text' value='"+((this.e_internal.obj.settings.valueMax - this.e_internal.obj.settings.valueMin) / 2)+"'></td></tr>";
            sText    += "<tr><td>"+ hqWidgets.Translate("Min value:")  +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_valueMin'  type='text' value='"+this.e_internal.obj.settings.valueMin+"'></td></tr>";
            sText    += "<tr><td>"+ hqWidgets.Translate("Max value:")  +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_valueMax'  type='text' value='"+this.e_internal.obj.settings.valueMax+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_gaugeColor' type='text' value='"+this.e_internal.attr.gaugeColor+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_gaugeColorBtn' style='width: 30px' type='button' value='...'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Horizontal:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_gaugeHorz' "+((this.e_internal.attr.gaugeHorz) ? "checked" : "")+">";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("From top/left:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_gaugeStart' "+((this.e_internal.attr.gaugeStart) ? "checked" : "")+">";
        }        
        
        // Static Text color, font, type
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeText) {
            sText    += "<tr><td>"+ hqWidgets.Translate("Text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_staticText'  type='text' value='"+this.e_internal.attr.staticText+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Font:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_staticTextFont'  type='text' value='"+this.e_internal.attr.staticTextFont+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Text color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_staticTextColor' type='text' value='"+this.e_internal.attr.staticTextColor+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_staticTextColorBtn' style='width: 30px' type='button' value='...'></td></tr>";
        }  

        // Active state icon
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam    && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Icon&nbsp;active:")+"</td><td>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_iconOn' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.iconOn == undefined) ? "":this.e_internal.attr.iconOn)+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_iconOnBtn' style='width: 30px' type='button' value='...'>";
            sTextAdv += "</td></tr>";
        } 
        
        // Camera URL, pop up delay, if show open door button
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            var s = "<td>"+ hqWidgets.Translate("Camera URL:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_ipCamImageURL'  type='text' value='"+(this.e_internal.attr.ipCamImageURL || "")+"'></td></tr>";
            if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam)
                sText += "<tr>"+s;
            else
                sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'>"+s;
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Pop up delay (ms):") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_popUpDelay'  type='text' value='"+this.e_internal.attr.popUpDelay+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Open door button:") +"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_openDoorBttn' "+(this.e_internal.attr.openDoorBttn ? "checked" : "")+" ></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Open door text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_openDoorBttnText'  type='text' value='"+this.e_internal.attr.openDoorBttnText+"'></td></tr>";
        }

        // Camera update interval for small image
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Small image update(sec):") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_ipCamUpdateSec'  type='text' value='"+this.e_internal.attr.ipCamUpdateSec+"'></td></tr>";
        }
        
        // Show percent
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeBlind || 
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGauge) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Show percent:") +"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_isShowPercent' "+((this.e_internal.attr.isShowPercent) ? "checked" : "")+"></td></tr>";
        }
        
        // gong wav, gong question, gong question image
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            sText    += "<tr><td>"+ hqWidgets.Translate("Gong wav file:")+"</td><td>";
            sText    += "<input id='"+this.e_settings.elemName+"_gongMelody' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.gongMelody == undefined) ? "":this.e_internal.attr.gongMelody)+"'>";
            sText    += "<input id='"+this.e_settings.elemName+"_gongMelodyBtn' style='width: 30px' type='button' value='...'>";
            sText    += "</td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Gong question:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_gongQuestion'  type='text' value='"+this.e_internal.attr.gongQuestion+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Gong question image:")+"</td><td>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_gongQuestionImg' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.gongQuestionImg == undefined) ? "":this.e_internal.attr.gongQuestionImg)+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_gongQuestionImgBtn' style='width: 30px' type='button' value='...'>";
            sTextAdv += "</td></tr>";
        }
            
        // if hide last action info after x hours
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam    && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDimmer && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge) {            
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Hide last action after (hrs):") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_hoursLastAction'  type='text' value='"+this.e_internal.attr.hoursLastAction+"'></td></tr>";
        }
        
        // Format string
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo  ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGauge) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Format string:")    +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoFormat'     type='text' value='"+this.e_internal.attr.infoFormat+"'></td></tr>";        
        }
        
        // Active condition, If hide when incative state
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Active condition:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoCondition'  type='text' value='"+((this.e_internal.attr.infoCondition != undefined) ? this.e_internal.attr.infoCondition : "")+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Hide inactive:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_infoIsHideInactive' "+((this.e_internal.attr.infoIsHideInactive) ? "checked" : "")+">";
        }  
        
        // No background
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo   ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeButton ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("No background:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_back' "+((this.e_internal.attr.noBackground) ? "checked" : "")+">";
        }
        
        // Styles
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo   ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeButton ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong   ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeOutTemp|| 
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInTemp ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeDimmer) {
            sTextStyle += "<tr id='idStyle"+(iStyleCount++)+"'><td>"+ hqWidgets.Translate("Normal:")+"</td><td id='"+this.e_settings.elemName+"_styleNormalParent' ></td></tr>";
            sTextStyle += "<tr id='idStyle"+(iStyleCount++)+"'><td>"+ hqWidgets.Translate("Normal hover:")+"</td><td id='"+this.e_settings.elemName+"_styleNormalHoverParent' ></td></tr>";
            
            if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
                this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp) {
                sTextStyle += "<tr id='idStyle"+(iStyleCount++)+"'><td>"+ hqWidgets.Translate("Active:")+"</td><td id='"+this.e_settings.elemName+"_styleActiveParent' ></td></tr>";
                sTextStyle += "<tr id='idStyle"+(iStyleCount++)+"'><td>"+ hqWidgets.Translate("Active hover:")+"</td><td id='"+this.e_settings.elemName+"_styleActiveHoverParent' ></td></tr>";
            }
        }
        
        
        // Description
        sText += "<tr><td>"+ hqWidgets.Translate("Description:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_title' type='text' value='"+((this.e_internal.attr.title) || "")+"'></td></tr>";

        // Show all styles
        this.e_settings.parent.append (sText);
        if (iStyleCount == 1)
            this.e_settings.parent.append (sTextStyle);
        else 
        if (iStyleCount > 1) {
            sTextStyle = "<tr><td colspan=2><button id='idShowStyle'>"+hqWidgets.Translate("Styles...")+"</td></tr>" + sTextStyle;
            this.e_settings.parent.append (sTextStyle);
            var advBtn = document.getElementById ('idShowStyle');
            advBtn.obj   = this;
            advBtn.state = false;
            
            $('#idShowStyle').button({icons: {primary: "ui-icon-carat-1-s"}}).click(function( event ) {
                                        this.state = !(this.state);
                                        if (this.state) {
                                            $('#idShowStyle').button("option", {icons: { primary: "ui-icon-carat-1-n" }});
                                            var i = 0;
                                            while (document.getElementById ('idStyle'+i)) {
                                                $('#idStyle'+i).show();
                                                i++;
                                            }
                                        }
                                        else {
                                            $('#idShowStyle').button("option", {icons: { primary: "ui-icon-carat-1-s" }});
                                            var i = 0;
                                            while (document.getElementById ('idStyle'+i)) {
                                                $('#idStyle'+i).hide();
                                                i++;
                                            }                                        
                                        }
                                  });
            // Hide all                      
            var i = 0;
            while (document.getElementById ('idStyle'+i)) {
                $('#idStyle'+i).hide();
                i++;
            }
        }
        
        // Show all advanced settigs
        if (iAdvCount == 1) {
            this.e_settings.parent.append (sTextAdv);
        }
        else
        if (iAdvCount > 0) {
            sTextAdv = "<tr><td colspan=2><button id='idShowAdv'>"+hqWidgets.Translate("Advanced...")+"</td></tr>" + sTextAdv;
            this.e_settings.parent.append (sTextAdv);
            var advBtn = document.getElementById ('idShowAdv');
            advBtn.obj   = this;
            advBtn.state = false;
            
            $('#idShowAdv').button({icons: {primary: "ui-icon-carat-1-s"}}).click(function( event ) {
                                        this.state = !(this.state);
                                        if (this.state) {
                                            $('#idShowAdv').button("option", {icons: { primary: "ui-icon-carat-1-n" }});
                                            var i = 0;
                                            while (document.getElementById ('idAdv'+i)) {
                                                $('#idAdv'+i).show();
                                                i++;
                                            }
                                        }
                                        else {
                                            $('#idShowAdv').button("option", {icons: { primary: "ui-icon-carat-1-s" }});
                                            var i = 0;
                                            while (document.getElementById ('idAdv'+i)) {
                                                $('#idAdv'+i).hide();
                                                i++;
                                            }                                        
                                        }
                                  });
            // Hide all                      
            var i = 0;
            while (document.getElementById ('idAdv'+i)) {
                $('#idAdv'+i).hide();
                i++;
            }
        }
        // Apply functionality
        
        this._EditCheckboxHandler ('state');
    
        var elem;
        if ((elem = document.getElementById (this.e_settings.elemName+'_popUp')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_popUp').click (function () { 
                this.parent.e_internal.obj.OnClick (true);
                $(this).attr('checked', false);
            });
        }        

        if (document.getElementById (this.e_settings.elemName+'_radius') != null) {
            this.e_internal.controlRadius = new this.hqSlider ({parent: $('#'+this.e_settings.elemName+'_radius'), 
                                                     withText: true, 
                                                     position: this.e_internal.attr.radius, 
                                                     max:      ((this.e_internal.attr.height>this.e_internal.attr.width) ? this.e_internal.attr.width/ 2:this.e_internal.attr.height/ 2), 
                                                     min:      0, 
                                                     width:    this.e_settings.width, 
                                                     onchangePrm: this, 
                                                     onchange: function (pos, obj_){
                                                        if (obj_.e_internal.attr.radius != pos) {
                                                            obj_.e_internal.attr.radius = pos;
                                                            
                                                            if (!isNaN(obj_.e_internal.attr.radius))
                                                                obj_.e_internal.obj.SetSettings ({radius: obj_.e_internal.attr.radius}, true);
                                                        }
                                                     }
            });
        }	
        // Icon width
        if (document.getElementById (this.e_settings.elemName+'_btIconWidth') != null) {
            this.e_internal.controlRadius = new this.hqSlider ({parent: $('#'+this.e_settings.elemName+'_btIconWidth'), 
                                                     withText: true, 
                                                     position: this.e_internal.attr.btIconWidth, 
                                                     max:      this.e_internal.attr.width, 
                                                     min:      0, 
                                                     width:    this.e_settings.width, 
                                                     onchangePrm: this, 
                                                     onchange: function (pos, obj_){
                                                        if (obj_.e_internal.attr.btIconWidth != pos) {
                                                            obj_.e_internal.attr.btIconWidth = pos;
                                                            
                                                            if (!isNaN(obj_.e_internal.attr.btIconWidth))
                                                                obj_.e_internal.obj.SetSettings ({btIconWidth: obj_.e_internal.attr.btIconWidth}, true);
                                                        }
                                                     }
            });
        }	
        // Icon height
        if (document.getElementById (this.e_settings.elemName+'_btIconHeight') != null) {
            this.e_internal.controlRadius = new this.hqSlider ({parent: $('#'+this.e_settings.elemName+'_btIconHeight'), 
                                                     withText: true, 
                                                     position: this.e_internal.attr.btIconHeight, 
                                                     max:      this.e_internal.attr.height, 
                                                     min:      0, 
                                                     width:    this.e_settings.width, 
                                                     onchangePrm: this, 
                                                     onchange: function (pos, obj_){
                                                        if (obj_.e_internal.attr.btIconHeight != pos) {
                                                            obj_.e_internal.attr.btIconHeight = pos;
                                                            
                                                            if (!isNaN(obj_.e_internal.attr.btIconHeight))
                                                                obj_.e_internal.obj.SetSettings ({btIconHeight: obj_.e_internal.attr.btIconHeight}, true);
                                                        }
                                                     }
            });
        }	
        
        // Auto height and width
        if (document.getElementById (this.e_settings.elemName+'_iconAutoBtn') != null) {
            document.getElementById (this.e_settings.elemName+'_iconAutoBtn').jControl = this;
            $('#'+this.e_settings.elemName+'_iconAutoBtn').click (function () {
                var obj = this.jControl;
                var newSettings = {};
                newSettings["btIconHeight"] = obj.e_internal.attr["height"] - 10;
                if (newSettings["btIconHeight"] < 0)
                    newSettings["btIconHeight"] = obj.e_internal.attr["height"];
                newSettings["btIconWidth"] = obj.e_internal.attr["width"] - 10;
                if (newSettings["btIconWidth"] < 0)
                    newSettings["btIconWidth"] = obj.e_internal.attr["width"];
                    
                obj.e_internal.obj.SetSettings (newSettings, true);
            });
        }
     
        
        
        // Process doorType changes
        if ((elem = document.getElementById (this.e_settings.elemName+'_door')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_door').change (function () {
                    this.parent.e_internal.attr.doorType = $(this).val();
                    this.parent.e_internal.obj.SetSettings ({doorType: this.parent.e_internal.attr.doorType}, true);
                });
        }		
        // Process window count changes
        if ((elem = document.getElementById (this.e_settings.elemName+'_wndCount')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_wndCount').change (function () {
                    var iCnt = $(this).val();
                    var a = this.parent.e_internal.attr.windowConfig.split(',');
                    var i;
                    var newS = "";
                    for (i = 0; i < iCnt; i++) {
                        newS  += ((newS  == "") ? "" : ",") + ((i < a.length) ? a[i] : hqWidgets.gSwingType.gSwingRight);
                    }
                    
                    this.parent.e_internal.attr.windowConfig = newS;
                    this.parent.e_internal.obj.SetSettings ({windowConfig: this.parent.e_internal.attr.windowConfig}, true);
                    hqWidgets.hqButtonEdit (this.parent.e_settings, this.parent.e_internal.obj, this.parent.e_internal.extra);
                });
        }	
        // Process window types changes
        var i;
        for (i =0 ; i < 4; i++) {
            elem = document.getElementById (this.e_settings.elemName+'_wnd'+i);
            if (elem)
            {
                elem.parent = this;
                elem.index = i;
                $('#'+this.e_settings.elemName+'_wnd'+i).change (function () {
                        var a = this.parent.e_internal.attr.windowConfig.split(',');
                        var i;
                        var newS = "";
                        for (i = 0; i < a.length; i++)
                            newS  += ((newS  == "") ? "" : ",") + ((this.index != i) ? a[i] : $(this).val());
                        
                        this.parent.e_internal.attr.windowConfig = newS;
                        this.parent.e_internal.obj.SetSettings ({windowConfig: this.parent.e_internal.attr.windowConfig}, true);
                    });
            }	
        }				
        // Process center image
        this._EditTextHandler('iconName');
        this._EditTextHandler('iconOn');   
        
        this._EditTextHandler('infoText', '', true);   
        this._EditTextHandler('infoTextFont');   
        this._EditColorHandler('infoTextColor');   
        this._EditTextHandler('infoFormat');   
        this._EditTextHandler('infoCondition');  
        
        this._EditTextHandler('staticText');   
        this._EditTextHandler('staticTextFont');   
        this._EditColorHandler('staticTextColor'); 
        
        this._EditTextHandler('valueSet', null, true);   
        this._EditColorHandler('gaugeColor');   
        this._EditTextHandler('valueMin');   
        this._EditTextHandler('valueMax');   
        this._EditCheckboxHandler ('gaugeHorz', false, false, true);
        this._EditCheckboxHandler ('gaugeStart', false, false, true);
        
        this._EditTextHandler('title');   
               
        this._EditCheckboxHandler ('infoIsHideInactive', false, false, true);
        this._EditCheckboxHandler ('noBackChanged', false, false, true);

        this._EditCheckboxHandler ('usejQueryStyle', false, false, true);
        this._EditCheckboxHandler ('isShowPercent', false, false, true, function (isChecked, obj) {
            if (!document.getElementById(obj.e_settings.elemName+'_hoursLastAction'))
                return;
            if (isChecked)
                document.getElementById(obj.e_settings.elemName+'_hoursLastAction').value = "-1";
            document.getElementById(obj.e_settings.elemName+'_hoursLastAction').disabled = isChecked;
        });
        this._EditTextHandler('ipCamImageURL');   
        this._EditTextHandler('popUpDelay');   
        this._EditCheckboxHandler ('openDoorBttn', false, false, true, function (isChecked, obj) {
            document.getElementById(obj.e_settings.elemName+'_openDoorBttnText').disabled = !isChecked;
        });
        if (document.getElementById(this.e_settings.elemName+'_openDoorBttnText')) {
            document.getElementById(this.e_settings.elemName+'_openDoorBttnText').disabled = !this.e_internal.attr.openDoorBttn;
        }
        this._EditTextHandler ('openDoorBttnText');
        this._EditTextHandler ('hoursLastAction');
        if (document.getElementById(this.e_settings.elemName+'_hoursLastAction') && this.e_internal.attr.isShowPercent) {
            document.getElementById(this.e_settings.elemName+'_hoursLastAction').value = "-1";
            document.getElementById(this.e_settings.elemName+'_hoursLastAction').disabled = this.e_internal.attr.isShowPercent;
        }
        this._EditTextHandler ('gongQuestion');
        this._EditTextHandler ('gongQuestionImg');
        
        this._EditTextHandler ('ipCamUpdateSec');
       
        this._EditTextHandler ('gongMelody', ".mp3;.wav");
        
        this._EditTextHandler ('gongQuestionImg');

        this._EditStyleHandler ('styleNormal',      null, '-button', 'background');
        this._EditStyleHandler ('styleNormalHover', null, '-button', 'background');
        this._EditStyleHandler ('styleActive',      null, '-button', 'background');
        this._EditStyleHandler ('styleActiveHover', null, '-button', 'background');

        
        this.e_internal.iAdvCount   = iAdvCount;
        this.e_internal.iStyleCount = iStyleCount;
        
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGauge) {
            $('#'+this.e_settings.elemName+'_valueSet').trigger('change');
        }
        
        if (this.e_internal.extra)
            this.e_internal.extra (this);
    },
    // Slider element for e_settings
    hqSlider: function (options){
        var settings = {
            parent:   $('body'),
            x:        null,
            y:        null,
            width:    100,  // - default horizontal
            height:   null, // - if vertical
            withText: true,
            min:      0,
            max:      100,
            position: null,
            onchange: null,   //- function (newPos, param)
            onchangePrm: null,
            orientation: 'horizontal',
        };
        var internal = {
            elemName:   null,
            isVertical: false,
            maxLength:  5,
            sposition:  999999,
            isVisible:  true,
            jelement:   null,
            element:    null,
            slider:     null,
            scale:      null,
            scalePos:   null,
            handler:    null,
            changed:    null, // function
            timer:      null,
            text:       null,
        };
        
        this.settings = $.extend (settings, options);
        this.internal = internal;
        var i = 0;
        while (document.getElementById ("slider_"+i)) i++;
        this.internal.elemName = "slider_"+i;
        this.internal.isVertical = (this.settings.orientation == 'vertical') || (this.settings.height != undefined);
        if (this.internal.isVertical) 
            this.settings.height = this.settings.height || 100;
        this.internal.maxLength  = (this.settings.max >= 10000) ? 5 : ((this.settings.max >= 1000) ? 4 : ((this.settings.max >= 100) ? 3: ((this.settings.max >= 10) ? 2 : 1)));

        var sText = "<table id='"+this.internal.elemName+"'><tr>";
        if (this.settings.withText) {
            sText += "<td><input type='text' id='"+this.internal.elemName+"_text' maxlength='"+this.internal.maxLength+"'></td>";
            if (this.internal.isVertical) 
                sText += "</tr><tr>";
        }
        sText += "<td><div id='"+this.internal.elemName+"_bar'></div></td></tr></table>";
        
        this.settings.parent.append (sText);
        this.internal.jelement = $('#'+this.internal.elemName).addClass("h-no-select");
        this.internal.slider   = $('#'+this.internal.elemName+'_bar').addClass("h-no-select");
        this.internal.slider.parent = this;
        
        if (this.settings.x != undefined)
            this.internal.jelement.css ({position: 'absolute', left: this.settings.x, top: (this.settings.y !== null) ? this.settings.y: 0});
        
        // Add class
        if (this.internal.isVertical) 
            this.internal.slider.addClass ('hq-slider-base-vert').css({height: '100%'});
        else 
            this.internal.slider.addClass ('hq-slider-base-horz').css({width: '100%'});
        
        this.internal.slider.append("<div id='"+this.internal.elemName+"_scale'></div>");
        this.internal.element = document.getElementById (this.internal.elemName+'_bar');
        this.internal.scale = $('#'+this.internal.elemName+"_scale");
        
        if (this.internal.isVertical) 
            this.internal.scale.css({position: 'absolute', top: 0, left: (this.internal.slider.width() - 9/*this.internal.scale.height()*/)/2}).addClass (".ui-widget-content").addClass ("hq-slider-control-vert");
        else 
            this.internal.scale.css({position: 'absolute', left: 0, top: (this.internal.slider.height() - 9/*this.internal.scale.height()*/)/2}).addClass (".ui-widget-content").addClass ("hq-slider-control-horz");
        
        this.internal.scale.append("<div id='"+this.internal.elemName+"_scalePos'></div>").addClass("h-no-select");
        this.internal.scalePos = $('#'+this.internal.elemName+"_scalePos");
        this.internal.scalePos.css({position: 'absolute', left: 0, top: 0}).addClass("h-no-select");
        
        if (this.internal.isVertical) 
            this.internal.scalePos.addClass("ui-state-hover").addClass("hq-slider-control-pos-vert");
        else  
            this.internal.scalePos.addClass("ui-state-hover").addClass ("hq-slider-control-pos-horz");
        
        this.internal.slider.append("<div id='"+this.internal.elemName+"_handler'></div>");
        this.internal.handler = $('#'+this.internal.elemName+"_handler");
        this.internal.handler.css({position: 'absolute', left: 0, top: 0}).addClass("h-no-select");
        
        if (this.internal.isVertical) 
            this.internal.handler.addClass ("ui-state-active").addClass ("hq-slider-handler-vert");
        else 
            this.internal.handler.addClass ("ui-state-active").addClass ("hq-slider-handler-horz");
        
        if (this.settings.withText) {
            this.internal.text = $('#'+this.internal.elemName+'_text').addClass('hq-slider-info');
            var elem = document.getElementById (this.internal.elemName+'_text');
            var timeout = 500;
            if (elem)
            {
                elem.parent = this;
                this.internal.parent = this;
                this.internal.changed = function ()
                {
                    var iPos = parseInt($('#'+this.elemName+'_text').val());
                    if (!isNaN(iPos))
                    {
                        this.parent.SetPosition (iPos);
                    }						
                };

                this.internal.text.change (function () {this.parent.internal.changed ();});
                this.internal.text.keyup (function () {
                    if (this.parent.internal.timer) clearTimeout (this.parent.internal.timer);
                    this.parent.internal.timer = setTimeout (function(elem) { elem.changed (); }, 500, this.parent);
                });
            }		
            
            this.internal.text.change (function () {			
                this.parent.SetPosition (parseInt ($(this).val()));
            });	}
            
        if (this.internal.isVertical) 
            this.internal.slider.css({height: this.settings.height - ((this.internal.text) ? this.internal.text.height() : 0)});
        else 
            this.internal.slider.css({width: this.settings.width   - ((this.internal.text) ? this.internal.text.width() : 0)});

        this.SetPosition = function (newPos, isForce) {
            newPos = parseInt (newPos);
            if (newPos < this.settings.min) newPos = this.settings.min;
            if (newPos > this.settings.max) newPos = this.settings.max;
            
            if (this.internal.sposition != newPos || isForce)
            {
                this.internal.sposition=newPos;
                if (this.internal.isVertical)
                {
                    var k = this.internal.slider.height()*(this.internal.sposition - this.settings.min)/(this.settings.max - this.settings.min);
                    this.internal.scalePos.css({height:k});
                    this.internal.handler.css({top:k - this.internal.handler.height()/2});
                }
                else
                {
                    var k = this.internal.slider.width()*(this.internal.sposition - this.settings.min)/(this.settings.max - this.settings.min);
                    this.internal.scalePos.css({width:k});
                    this.internal.handler.css({left:k - this.internal.handler.width()/2});
                }
                if (this.internal.text)
                    document.getElementById (this.internal.elemName + "_text").value = ""+newPos;
                    
                if (this.settings.onchange)
                    this.settings.onchange (this.internal.sposition, this.settings.onchangePrm);
            }
        };
        this.SetRange = function (min, max) {
            this.settings.min = min;
            this.settings.max = max;
            this.SetPosition (this.internal.sposition, true);
        }
        // Set length or height
        this.SetSize = function (size) {
            if (size != undefined)
            {
                if (this.internal.isVertical)
                {
                    this.settings.height = size;
                    this.internal.slider.css({height: this.settings.height - ((this.internal.text) ? this.internal.text.height() : 0)});
                }
                else 
                {
                    this.settings.width = size;
                    this.internal.slider.css({width: this.settings.width - ((this.internal.text) ? this.internal.text.width() : 0)});
                }

                this.SetPosition(this.internal.sposition, true);
            }
        }
        
        document.getElementById (this.internal.elemName+'_bar').parentQuery = this;
        this.OnMouseMove = function (x, y) {
            var pos;
            if (this.internal.isVertical)
            {
                var yOffset = y - this.internal.slider.offset().top;// - this.slider.position().top;
                pos = (this.settings.max - this.settings.min)/this.internal.slider.height () * yOffset + this.settings.min;
            }
            else
            {
                var xOffset = x - this.internal.slider.offset().left; //this.slider.position().left;
                pos = (this.settings.max - this.settings.min)/this.internal.slider.width () * xOffset + this.settings.min;
            }
            this.SetPosition (pos);
        }
        this.OnMouseDown = function (x, y, isTouch) {
            hqWidgets.gDynamics.gActiveSlider = this;
            hqWidgets.onMouseMove (x, y);	
            return false;
        }
        this.internal.slider.bind ("mousedown", {msg: this}, function (e) {
            if (e.data.msg.OnMouseDown(e.pageX, e.pageY, false)) e.preventDefault();	
            return false;
        });
        this.internal.element.addEventListener('touchstart', function(e) {
            e.preventDefault();
            hqWidgets.gDynamics.gIsTouch=true;
            e.target.parentQuery.OnMouseDown (e.touches[0].pageX, e.touches[0].pageY, true);
        }, false);
        this.Position = function () {
            return this.internal.sposition;
        }
        this.Show = function () {
            this.internal.isVisible = true;
            this.internal.jelement.show();
            return this;
        }
        this.Hide = function () {
            this.internal.isVisible = false;
            this.internal.jelement.hide();
            return this;
        }	
        this.SetPosition ((this.settings.position !== null) ? this.settings.position : this.settings.min);
    },
});