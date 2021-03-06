var CircleBoxMorph = require('./CircleBoxMorph');
var Color = require('./Color');
var SliderButtonMorph = require('./SliderButtonMorph');
var Point = require('./Point');

var SliderMorph = Class.create(CircleBoxMorph, {

	// SliderMorph ///////////////////////////////////////////////////
	
	initialize: function($super, start, stop, value, size, orientation, color) {
	    this.init(
	        start || 1,
	        stop || 100,
	        value || 50,
	        size || 10,
	        orientation || 'vertical',
	        color
	    );
	},

	init: function (
		$super,
	    start,
	    stop,
	    value,
	    size,
	    orientation,
	    color
	) {
	    this.target = null;
	    this.action = null;
	    this.start = start;
	    this.stop = stop;
	    this.value = value;
	    this.size = size;
	    this.offset = null;
	    this.button = new SliderButtonMorph();
	    this.button.isDraggable = false;
	    this.button.color = new Color(200, 200, 200);
	    this.button.highlightColor = new Color(210, 210, 255);
	    this.button.pressColor = new Color(180, 180, 255);
	    $super(orientation);
	    this.add(this.button);
	    this.alpha = 0.3;
	    this.color = color || new Color(0, 0, 0);
	    this.setExtent(new Point(20, 100));
	    // this.drawNew();
	},

	autoOrientation: function () {
	    nop();
	},

	rangeSize: function () {
	    return this.stop - this.start;
	},

	ratio: function () {
	    return this.size / this.rangeSize();
	},

	unitSize: function () {
	    if (this.orientation === 'vertical') {
	        return (this.height() - this.button.height()) /
	            this.rangeSize();
	    }
	    return (this.width() - this.button.width()) /
	        this.rangeSize();
	},

	drawNew: function ($super) {
	    var bw, bh, posX, posY;

	    $super();
	    this.button.orientation = this.orientation;
	    if (this.orientation === 'vertical') {
	        bw  = this.width() - 2;
	        bh = Math.max(bw, Math.round(this.height() * this.ratio()));
	        this.button.silentSetExtent(new Point(bw, bh));
	        posX = 1;
	        posY = Math.min(
	            Math.round((this.value - this.start) * this.unitSize()),
	            this.height() - this.button.height()
	        );
	    } else {
	        bh = this.height() - 2;
	        bw  = Math.max(bh, Math.round(this.width() * this.ratio()));
	        this.button.silentSetExtent(new Point(bw, bh));
	        posY = 1;
	        posX = Math.min(
	            Math.round((this.value - this.start) * this.unitSize()),
	            this.width() - this.button.width()
	        );
	    }
	    this.button.setPosition(
	        new Point(posX, posY).add(this.bounds.origin)
	    );
	    this.button.drawNew();
	    this.button.changed();
	},

	updateValue: function () {
	    var relPos;
	    if (this.orientation === 'vertical') {
	        relPos = this.button.top() - this.top();
	    } else {
	        relPos = this.button.left() - this.left();
	    }
	    this.value = Math.round(relPos / this.unitSize() + this.start);
	    this.updateTarget();
	},

	updateTarget: function () {
	    if (this.action) {
	        if (typeof this.action === 'function') {
	            this.action.call(this.target, this.value);
	        } else { // assume it's a String
	            this.target[this.action](this.value);
	        }
	    }
	},

	// SliderMorph duplicating:

	copyRecordingReferences: function ($super, dict) {
	    // inherited, see comment in Morph
	    var c = $super(dict);
	    if (c.target && dict[this.target]) {
	        c.target = (dict[this.target]);
	    }
	    if (c.button && dict[this.button]) {
	        c.button = (dict[this.button]);
	    }
	    return c;
	},

	// SliderMorph menu:

	developersMenu: function ($super) {
	    var menu = $super();
	    menu.addItem(
	        "show value...",
	        'showValue',
	        'display a dialog box\nshowing the selected number'
	    );
	    menu.addItem(
	        "floor...",
	        function () {
	            this.prompt(
	                menu.title + '\nfloor:',
	                this.setStart,
	                this,
	                this.start.toString(),
	                null,
	                0,
	                this.stop - this.size,
	                true
	            );
	        },
	        'set the minimum value\nwhich can be selected'
	    );
	    menu.addItem(
	        "ceiling...",
	        function () {
	            this.prompt(
	                menu.title + '\nceiling:',
	                this.setStop,
	                this,
	                this.stop.toString(),
	                null,
	                this.start + this.size,
	                this.size * 100,
	                true
	            );
	        },
	        'set the maximum value\nwhich can be selected'
	    );
	    menu.addItem(
	        "button size...",
	        function () {
	            this.prompt(
	                menu.title + '\nbutton size:',
	                this.setSize,
	                this,
	                this.size.toString(),
	                null,
	                1,
	                this.stop - this.start,
	                true
	            );
	        },
	        'set the range\ncovered by\nthe slider button'
	    );
	    menu.addLine();
	    menu.addItem(
	        'set target',
	        "setTarget",
	        'select another morph\nwhose numerical property\nwill be ' +
	            'controlled by this one'
	    );
	    return menu;
	},

	showValue: function () {
	    this.inform(this.value);
	},

	userSetStart: function (num) {
	    // for context menu demo purposes
	    this.start = Math.max(num, this.stop);
	},

	setStart: function (num) {
	    // for context menu demo purposes
	    var newStart;
	    if (typeof num === 'number') {
	        this.start = Math.min(
	            num,
	            this.stop - this.size
	        );
	    } else {
	        newStart = parseFloat(num);
	        if (!isNaN(newStart)) {
	            this.start = Math.min(
	                newStart,
	                this.stop - this.size
	            );
	        }
	    }
	    this.value = Math.max(this.value, this.start);
	    this.updateTarget();
	    this.drawNew();
	    this.changed();
	},

	setStop: function (num) {
	    // for context menu demo purposes
	    var newStop;
	    if (typeof num === 'number') {
	        this.stop = Math.max(num, this.start + this.size);
	    } else {
	        newStop = parseFloat(num);
	        if (!isNaN(newStop)) {
	            this.stop = Math.max(newStop, this.start + this.size);
	        }
	    }
	    this.value = Math.min(this.value, this.stop);
	    this.updateTarget();
	    this.drawNew();
	    this.changed();
	},

	setSize: function (num) {
	    // for context menu demo purposes
	    var newSize;
	    if (typeof num === 'number') {
	        this.size = Math.min(
	            Math.max(num, 1),
	            this.stop - this.start
	        );
	    } else {
	        newSize = parseFloat(num);
	        if (!isNaN(newSize)) {
	            this.size = Math.min(
	                Math.max(newSize, 1),
	                this.stop - this.start
	            );
	        }
	    }
	    this.value = Math.min(this.value, this.stop - this.size);
	    this.updateTarget();
	    this.drawNew();
	    this.changed();
	},

	setTarget: function (targetMenu, propertyMenu) {
	    var choices = this.overlappedMorphs(),
	        // menu = new MenuMorph(this, 'choose target:'),
	        myself = this;

	    choices.push(this.world());
	    choices.forEach(function (each) {
	        targetMenu.addItem(each.toString().slice(0, 50), function () {
	            myself.target = each;
	            myself.setTargetSetter();
	        });
	    });
	    if (choices.length === 1) {
	        this.target = choices[0];
	        this.setTargetSetter(propertyMenu);
	    } else if (choices.length > 0) {
	        menu.popUpAtHand(this.world());
	    }
	},

	setTargetSetter: function (menu) {
	    var choices = this.target.numericalSetters(),
	        // menu = new MenuMorph(this, 'choose target property:'),
	        myself = this;

	    choices.forEach(function (each) {
	        menu.addItem(each, function () {
	            myself.action = each;
	        });
	    });
	    if (choices.length === 1) {
	        this.action = choices[0];
	    } else if (choices.length > 0) {
	        menu.popUpAtHand(this.world());
	    }
	},

	numericalSetters: function ($super) {
	    // for context menu demo purposes
	    var list = $super();
	    list.push('setStart', 'setStop', 'setSize');
	    return list;
	},

	// SliderMorph stepping:

	step: null,

	mouseDownLeft: function (pos) {
	    var world, myself = this;

	    if (!this.button.bounds.containsPoint(pos)) {
	        this.offset = new Point(); // return null;
	    } else {
	        this.offset = pos.subtract(this.button.bounds.origin);
	    }
	    world = this.root();
	    this.step = function () {
	        var mousePos, newX, newY;
	        if (world.hand.mouseButton) {
	            mousePos = world.hand.bounds.origin;
	            if (myself.orientation === 'vertical') {
	                newX = myself.button.bounds.origin.x;
	                newY = Math.max(
	                    Math.min(
	                        mousePos.y - myself.offset.y,
	                        myself.bottom() - myself.button.height()
	                    ),
	                    myself.top()
	                );
	            } else {
	                newY = myself.button.bounds.origin.y;
	                newX = Math.max(
	                    Math.min(
	                        mousePos.x - myself.offset.x,
	                        myself.right() - myself.button.width()
	                    ),
	                    myself.left()
	                );
	            }
	            myself.button.setPosition(new Point(newX, newY));
	            myself.updateValue();
	        } else {
	            this.step = null;
	        }
	    };
	}
});

SliderMorph.uber = CircleBoxMorph.prototype;
SliderMorph.className = 'SliderMorph';

module.exports = SliderMorph;