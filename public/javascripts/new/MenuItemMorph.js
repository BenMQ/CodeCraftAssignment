var Morph = require('./Morph');
var TriggerMorph = require('./TriggerMorph');
var TextMorph = require('./TextMorph');
var Point = require('./Point');
var Rectangle = require('./Rectangle');


var MenuItemMorph = Class.create(TriggerMorph, {

	// MenuItemMorph ///////////////////////////////////////////////////////
	
	initialize: function(
	    target,
	    action,
	    labelString, // can also be a Morph or a Canvas or a tuple: [icon, string]
	    fontSize,
	    fontStyle,
	    environment,
	    hint,
	    color,
	    bold,
	    italic,
	    doubleClickAction // optional when used as list morph item
	) {
	    this.init(
	        target,
	        action,
	        labelString,
	        fontSize,
	        fontStyle,
	        environment,
	        hint,
	        color,
	        bold,
	        italic,
	        doubleClickAction
	    );
	},

	createLabel: function () {
	    var icon, lbl, np, rect;
	    if (this.label !== null) {
	        this.label.destroy();
	    }
	    if (isString(this.labelString)) {
	        this.label = this.createLabelString(this.labelString);
	    } else if (this.labelString instanceof Array) {
	        // assume its pattern is: [icon, string]
	        this.label = new Morph();
	        this.label.alpha = 0; // transparent
	        icon = this.createIcon(this.labelString[0]);
	        this.label.add(icon);
	        lbl = this.createLabelString(this.labelString[1]);
	        this.label.add(lbl);
	        lbl.setCenter(icon.center());
	        lbl.setLeft(icon.right() + 4);
	        this.label.bounds = (icon.bounds.merge(lbl.bounds));
	        this.label.drawNew();
	    } else { // assume it's either a Morph or a Canvas
	        this.label = this.createIcon(this.labelString);
	    }
	    this.silentSetExtent(this.label.extent().add(new Point(8, 0)));
	    np = this.position().add(new Point(4, 0));
	    rect = new Rectangle(0, 0, 0, 0);
	    this.label.bounds = np.extent(rect, this.label.extent());
	    this.add(this.label);
	},

	createIcon: function (source) {
	    // source can be either a Morph or an HTMLCanvasElement
	    var icon = new Morph(),
	        src;
	    icon.image = source instanceof Morph ? source.fullImage() : source;
	    // adjust shadow dimensions
	    if (source instanceof Morph && source.getShadow()) {
	        src = icon.image;
	        icon.image = newCanvas(
	            source.fullBounds().extent().subtract(
	                this.shadowBlur * (useBlurredShadows ? 1 : 2)
	            )
	        );
	        icon.image.getContext('2d').drawImage(src, 0, 0);
	    }
	    icon.silentSetWidth(icon.image.width);
	    icon.silentSetHeight(icon.image.height);
	    return icon;
	},

	createLabelString: function (string) {
	    var lbl = new TextMorph(
	        string,
	        this.fontSize,
	        this.fontStyle,
	        this.labelBold,
	        this.labelItalic
	    );
	    lbl.setColor(this.labelColor);
	    return lbl;
	},

	// MenuItemMorph events:

	mouseEnter: function () {
	    if (!this.isListItem()) {
	        this.image = this.highlightImage;
	        this.changed();
	    }
	    if (this.hint) {
	        this.bubbleHelp(this.hint);
	    }
	},

	mouseLeave: function () {
	    if (!this.isListItem()) {
	        this.image = this.normalImage;
	        this.changed();
	    }
	    if (this.hint) {
	        this.world().hand.destroyTemporaries();
	    }
	},

	mouseDownLeft: function (pos) {
	    if (this.isListItem()) {
	        this.parent.unselectAllItems();
	        this.escalateEvent('mouseDownLeft', pos);
	    }
	    this.image = this.pressImage;
	    this.changed();
	},

	mouseMove: function () {
	    if (this.isListItem()) {
	        this.escalateEvent('mouseMove');
	    }
	},

	mouseClickLeft: function () {
	    if (!this.isListItem()) {
	        this.parent.destroy();
	        this.root().activeMenu = null;
	    }
	    this.trigger();
	},

	isListItem: function () {
	    if (this.parent) {
	        return this.parent.isListContents;
	    }
	    return false;
	},

	isSelectedListItem: function () {
	    if (this.isListItem()) {
	        return this.image === this.pressImage;
	    }
	    return false;
	}
});

MenuItemMorph.uber = TriggerMorph.prototype;
MenuItemMorph.className = 'MenuItemMorph';

module.exports = MenuItemMorph;