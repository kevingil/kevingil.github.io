	
console.log("sup");
	var mediaElement;
	var playing = false;
	var playedOnce = false;

	MediaElement('bernies', {
            pluginPath: '/lib/',
            success: function(me)
            {
			console.log("loaded");
			mediaElement = me;
			console.log(me);
			console.log(me.play());
			me.addEventListener('timeupdate', function(time)
			{
				if (me.currentTime > 1.5 && playing == false)
				{
					// Trigger start
					playing = true;
				}
				else if (me.currentTime < 2 && playing == true)
				{
					playing = false;
					playedOnce = true;
					$("myCanvas").css("background-color","#fff");
				}
				else if (playing == false)
					$("myCanvas").css("background-color","#fff");
			});
		}
	});

	var bernies = [];
	var possibleBernies = ["bern1", "bern2", "bern3", "bern4", "bern5", "bern6", "bern7", "bern4"];

	var BackgroundManager = Base.extend({
		initialize: function() {
			this.stateTime = 0;
console.log("backgroundmanager initied");
		},
		update: function(delta) {
console.log("backgroundmanager update");
			this.stateTime += delta;
			if (this.stateTime > 0.1) {
				var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
				$("#myCanvas").css("background-color",hue);
				this.stateTime = 0;
			}
		}
	});

	var Bernie = Base.extend({
		initialize: function(stageWidth, stageHeight, time, rotateFactor) {
console.log("bernie initied");
			var p1 = new Point(0, stageHeight);
			var p2 = new Point(time/2, 0);
			var p3 = new Point(time, stageHeight);
			// Create the
			this.a = (p3.x * (-p1.y + p2.y) + p2.x * (p1.y - p3.y) + p1.x * (-p2.y + p3.y)) / ((p1.x - p2.x) * (p1.x - p3.x) * (p2.x - p3.x));
			this.b = (p3.x * p3.x * (p1.y - p2.y) + p1.x * p1.x * (p2.y - p3.y) + p2.x + p2.x * (-p1.y + p3.y)) / ((p1.x - p2.x) * (p1.x - p3.x) * (p2.x - p3.x));
			this.c = (p3.x * ( p2.x * (p2.x - p3.x) * p1.y + p1.x * (-p1.x + p3.x) * p2.y) + p1.x * (p1.x - p2.x) * p2.x * p3.y) / ((p1.x - p2.x) * (p1.x - p3.x) * (p2.x - p3.x));
			this.rotateFactor = rotateFactor;
			this.endX = stageWidth / 2;
			var bernieId = possibleBernies[Math.floor(Math.random()*possibleBernies.length)];
			this.bernie = new Raster(bernieId);
			this.bernie.position = p1;
			this.stateTime = 0;
			this.totalTime = time;
			this.endPoint = p3;
			this.isAlive = true;
		},
		update: function(delta) {
console.log("bernie update");
			if (this.isAlive) {
				this.stateTime += delta;

				this.bernie.position.y = this.a * this.stateTime * this.stateTime + this.b * this.stateTime + this.c;

				this.bernie.position.x = this.stateTime/this.totalTime * this.endX;

				this.bernie.rotate(delta * this.rotateFactor);

				if (this.stateTime > this.totalTime + 1) {
					this.bernie.remove();
					this.isAlive = false;
				}
			}
		}
	});

	var TextManager = Base.extend({
		initialize: function() {
			this.stateTime = 0;
			this.text = new PointText(view.center);
			this.text.paragraphStyle.justification = 'center';
			this.text.characterStyle.fontSize = 15;
			this.text.characterStyle.font = 'monospace';
			this.text.fillColor = 'black';
		},
		update: function(delta, playing) {
			this.stateTime += delta;
			if (!playing) {
				if (playedOnce)
					this.text.content = "Please wait, reloading more Bernies";
				else
					this.text.content = "Do we feel the Bern?!?!";
				if (Math.floor(this.stateTime % 1.5) == 0) {
					// this.text.content = "Please wait, loading Bernies";
					this.text.characterStyle.fontSize = 15;
				}
				else {
					// this.text.content = "Please wait, loading Bernies";
					this.text.characterStyle.fontSize = 17;
				}
			}
			else {
				this.text.content = "";
			}
		}
	});

	var bernieEmitter = Base.extend({
		initialize: function(rate) {
			this.rate = rate;
			this.lastEmit = 0;
			this.stateTime = 0;
		},
		update: function(delta) {
			this.stateTime += delta;
			if (this.lastEmit + this.rate < this.stateTime) {
				// Emit a bernie
				var randomX = (Math.random() * view.size.width / 1) - (view.size.width / 1 / 2);
				var randomY = (Math.random() * view.size.height / 1) - (view.size.height / 1 / 2);
				var randomRotate = Math.random() * 200 - 100;
				bernies.push(new Bernie(view.size.width + randomX, view.size.height + randomY, 2, randomRotate));
				this.lastEmit = this.stateTime;
			}
		},
		clear: function() {
			var i;
			for (i = 0; i < bernies.length; i++) {
				bernies[i].remove();
			}
		}
	});

	var bernieEmitter = new bernieEmitter(0.15);
	var backgroundManager = new BackgroundManager();
	var textManager = new TextManager();

	function onFrame(event) {
		if (playing)
		{
			backgroundManager.update(event.delta);
			bernieEmitter.update(event.delta);
			// Clean up dead bernies
			for (var i = 0; i < bernies.length; i++) {
				if (bernies[i].isAlive == false) {
					bernies.splice(i, 1);
				}
				else {
					bernies[i].update(event.delta);
				}
			}
		}
		else {// Clean up dead bernies
			for (var i = 0; i < bernies.length; i++) {
				if (bernies[i].isAlive == false) {
					bernies.splice(i, 1);
				}
				else {
					bernies[i].update(event.delta);
				}
			}
		}
		textManager.update(event.delta, playing);
	}
