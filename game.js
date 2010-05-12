var hStat=function() {
	this.side=0;
	this.hp=20;
	this.att=50;
	this.dam=5;
	this.def=25;
	this.init=4;
	this.tInit=4;
	this.alive=true;
	this,turnEnd=false;
	this.turn=function() {
		if (rw.key('z')) {
			attack(rw.rules['combat'].ppl[0],rw.rules['combat'].ppl[1]);
			this.turnEnd=true;
		};
	};
};

var vStat=function() {
	this.side=1;
	this.hp=15;
	this.att=50;
	this.dam=5;
	this.def=0;
	this.init=8;
	this.tInit=8;
	this.ticker=40;
	this.alive=true;
	this.turnEnd=false;
	this.turn=function() {
		if (this.ticker>0) {
			this.ticker--;
		} else {
			this.ticker=40;
			attack(rw.rules['combat'].ppl[1],rw.rules['combat'].ppl[0]);
			this.turnEnd=true;
		};
	};
};

var attack=function(a,t) {
	var roll = Math.round(Math.random()*100)-t.def;
	if (roll>=a.att) {
		t.hp-=a.dam;
	};
	if (t.hp<=0) t.alive=false;
};

var combat=function() {
	this.base=new rw.rule(true);
	this.ppl=[new hStat(),new vStat()];
	this.isUp=[];
	this.pause=false;
	this.rule=function() {
		if (this.pause==false) {
			for (var x=0;x<this.ppl.length;x++) {
				var psn = this.ppl[x];
				if (psn.alive) {
					if (psn.tInit>0) {
						psn.tInit--;
					};
					if (psn.tInit==0) {
						psn.tInit=psn.init;
						this.isUp.push(x);
						this.pause=true;
					}
				}
			}
		} else {
			if (this.isUp.length>0) {
				var psn = this.ppl[this.isUp[0]];
				if (psn.alive) {
					psn.turn();
					if (psn.turnEnd) {
						this.isUp.shift();
						psn.turnEnd=false;
					};
				} else {
					this.isUp.shift();
				};
			} else {
				this.pause=false;
			}
		}
	}
};

var combatStat=function() {
	this.base=rw.ent('combat','',' ','',320,320);
	this.update=function() {
		var comb=rw.rules['combat'];
		var text='Hero HP: '+comb.ppl[0].hp+' Villan HP: '+comb.ppl[1].hp;
		if ((comb.isUp[0])||(comb.isUp[0]==0)) text+=' Is Up: '+comb.isUp[0];
		this.base.detach().attach(
			document.createTextNode(text)
		);
	};
};

var wallCount=0;
var wall=function(x,y) {
	this.base=rw.ent('wall'+wallCount++,'','','',x,y);
	this.update=function() {};
	this.hitMap=[['wall',['hero'],0,0,x,y]];
};

var hero=function() {
	this.base=rw.ent('hero','hero/rangerF','d1','png',16,18);
	this.dir='d';
	this.moveCount=0;
	this.moveDir=false;
	this.ani=1;
	this.update=function() {
		var moving=false;
		if (rw.key('ua')) {
			this.base.move(0,-0.5);
			moving=true;
			this.dir='u';
		} else if (rw.key('da')) {
			this.base.move(0,0.5);
			moving=true;
			this.dir='d';
		} else if (rw.key('la')) {
			this.base.move(-0.5,0);
			moving=true;
			this.dir='l';
		} else if (rw.key('ra')) {
			this.base.move(0.5,0);
			moving=true;
			this.dir='r';
		};
		if(moving) {
			if (this.moveCount<8) {
				this.moveCount++;
			} else {
				this.moveCount=0;
				if (this.moveDir==false) {
					if (this.ani<2) {
						this.ani++;
					} else {
						this.ani--;
						this.moveDir=!this.moveDir;
					};
				} else {
					if (this.ani>0) {
						this.ani--;
					} else {
						this.ani++;
						this.moveDir=!this.moveDir;
					};
				};
			};
		} else {
			//this.ani=1;
		};
		this.base.changeSprite(this.dir+this.ani);
	};
	this.hitMap=[['hero',['wall'],0,2,16,18]];
	this.gotHit=function(by) {
		if (by=='wall') {
			this.base.wipeMove();
		};
	};
}

var startGame=function() {
	rw.init(320,320)
	.setFPS(40)
	.using('hero/rangerF','png',['u0','u1','u2','d0','d1','d2','l0','l1','l2','r0','r1','r2'])
	.newRule('combat',new combat())
	.newEnt(new combatStat()).base.display(' ',0,0,0).end()
	/*.newMap('map','map01','png',320,320).display().end()
	.newEnt(new hero()).base.display('d1',0,0,0).end()
	.newEnt(new wall(64,64)).base.display('',16,192,0).end()
	.newEnt(new wall(64,48)).base.display('',144,16,0).end()
	.newEnt(new wall(16,16)).base.display('',144,64,0).end()
	.newEnt(new wall(32,32)).base.display('',208,16,0).end()
	.newEnt(new wall(16,16)).base.display('',208,48,0).end()*/
	.start();
};
