var hStat=function() {
	this.side=0;
	this.hp=20;
	this.att=50;
	this.dam=5;
	this.def=50;
	this.init=4;
	this.tInit=4;
	this.alive=true;
	this.turnEnd=false;
	this.pos=0;
	this.choice=false;
	this.choices=[
		['attack','defend'],
		['heal'],
		['item']
	];
	this.turn=function() {
		var comb=rw.rules['combat'];
		comb.leadUp=true;
		comb.choices=this.choices;
		if (comb.act) {
			if (comb.choice===0) {
				attack(this,comb.ppl[comb.targeting]);
			} else if (comb.choice===1) {
				if (Math.random()>0.5) comb.ppl[comb.targeting].hp+=5;
			};
			this.turnEnd=true;
		}
	};
};

var party = {
	lead:new hStat()
};

var vStat=function() {
	this.side=1;
	this.hp=20;
	this.att=50;
	this.dam=5;
	this.def=25;
	this.init=8;
	this.tInit=8;
	this.ticker=40;
	this.alive=true;
	this.turnEnd=false;
	this.pos=0;
	this.turn=function() {
		if (this.ticker>0) {
			this.ticker--;
		} else {
			this.ticker=40;
			attack(this,rw.rules['combat'].ppl[0]);
			this.turnEnd=true;
		};
	};
};

var attack=function(a,t) {
	var roll = (a.att-t.def)+Math.round(Math.random()*100);
	if (roll>=50) {
		t.hp-=a.dam;
	};
	if (t.hp<=0) t.alive=false;
};

var combat=function() {
	this.base=new rw.rule(true);
	this.ppl=[party.lead,0,0,new vStat(),new vStat(),0,0,0,0,0];
	this.isUp=[];
	this.pause=false;
	this.leadUp=false;
	this.secondUp=false;
	this.thirdUp=false;
	this.menu=false;
	this.choice=false;
	this.subChoice=false;
	this.choices=[];
	this.targeting=false;
	this.act=false;
	this.delay=0;
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
						this.choice=false;
						this.subChoice=false;
						this.act=false;
						this.targeting=false;
						this.leadUp=false;
						this.secondUp=false;
						this.thirdUp=false;
					};
				} else {
					this.isUp.shift();
				};
			} else {
				this.pause=false;
			}
			var side0=false,side1=false;
			for(var x=0;x<this.ppl.length;x++) {
				var psn=this.ppl[x];
				if (psn.alive) {
					if(psn.side==0) {
						side0=true;
					} else {
						side1=true;
					};
				};
			};
			if (side0==false) rw.atEnd(gameOver);
			if (side1==false) rw.atEnd(loadMain); // Change this to load get loot screen
		};
		// Key related stuff
		if (this.delay<1) {
			if ((this.leadUp)||(this.secondUp)||(this.thirdUp)) {
				if ((this.targeting===false)&&(this.menu===false)) {
					if (rw.key('z')) {
						this.menu=true;
						this.choice=0;
						this.delay=10;
					};
				} else if (this.menu!==false) {
					if (this.subChoice===false) {
						if (rw.key('da')) {
							(this.choice<this.choices.length-1) ? this.choice++:this.choice=0;
							this.delay=10;
						} else if (rw.key('ua')) {
							(this.choice>0) ? this.choice--:this.choice=this.choices.length-1;
							this.delay=10;
						} else if (rw.key('z')) {
							this.subChoice=0;
							this.delay=10;
						};
					} else {
						if (rw.key('da')) {
							(this.subChoice<this.choices.length-1) ? this.subChoice++:this.subChoice=0;
							this.delay=10;
						} else if (rw.key('ua')) {
							(this.subChoice>0) ? this.subChoice--:this.subChoice=this.choices.length-1;
							this.delay=10;
						} else if (rw.key('z')) {
							this.menu=false;
							this.targeting=3;
							this.delay=10;
						} else if (rw.key('x')) {
							this.subChoice=false;
							this.delay=10;
						};
					};
				} else if (this.targeting!==false) {
					if (rw.key('da')) {
						(this.targeting<8) ? this.targeting++:this.targeting=0;
						this.delay=10;
					} else if (rw.key('ua')) {
						(this.targeting>0) ? this.targeting--:this.targeting=8;
						this.delay=10;
					} else if (rw.key('z')) {
						this.act=true;
					} else if (rw.key('x')) {
						this.targeting=false;
						this.menu=true;
						this.delay=10;
					};
				}
			}
		} else {
			this.delay--;
		};
	}
};

var combatHero=function(num,heroClass,gender) {
	this.base=rw.ent(num+'_combat','combat/hero',heroClass+gender,'png',32,36);
	this.num=num;
	this.update=function() {
	};
};

var combatVillan=function(num,heroClass,gender) {
	this.base=rw.ent(num+'_combat','combat/npc',heroClass+gender,'png',32,36);
	this.num=num;
	this.alive=true;
	this.update=function() {
		if ((rw.rules['combat'].ppl[this.num].alive==false)&&(this.alive)) {
			this.alive=false;
			this.base.shiftSprite(-32,0);
		};
	};
};

// Arrow for displaying which hero is up
var selectArrow=function() {
	this.base=rw.ent('selectArrow','menu',' ','png',16,16);
	this.update=function() {
		var comb=rw.rules['combat'];
		if (comb.leadUp) {
			this.base.moveTo(0,56,56);
			this.base.changeSprite('arrowR');
		} else if (comb.secondUp) {
			this.base.moveTo(0,104,104);
			this.base.changeSprite('arrowR');
		} else if (comb.thirdUp) {
			this.base.moveTo(0,152,152);
			this.base.changeSprite('arrowR');
		} else {
			this.base.changeSprite(' ');
		};
	};
};

// Pop-up menu of actions a hero can take
var selectMenu=function() {
	this.base=rw.ent('selectmenu','menu',' ','png',112,80);
	this.update=function() {
		var comb=rw.rules['combat'];
		if (comb.menu===false) {
			this.base.changeSprite(' ');
		} else {
			this.base.changeSprite('selectmenu');
		};
	};
};

// Arrow for choosing what action to take
var choiceArrow=function() {
	this.base=rw.ent('choicearrow','menu',' ','png',16,16);
	this.update=function() {
		var comb=rw.rules['combat'];
		if (comb.menu!==false) {
			this.base.changeSprite('arrowR')
			.moveTo(108,72+(16*comb.choice));
		} else {
			this.base.changeSprite(' ');
		};
	};
};

var subMenu=function() {
	this.base=rw.ent('submenu','menu',' ','png',128,128);
	this.update=function() {
		var comb=rw.rules['combat'];
		if ((comb.subChoice!==false)&&(comb.targeting===false)) {
			this.base.changeSprite('subselectmenu');
		} else {
			this.base.changeSprite(' ');
		};
	};
};

var subArrow=function() {
	this.base=rw.ent('subarrow','menu',' ','png',16,16);
	this.update=function() {
		var comb=rw.rules['combat'];
		if ((comb.subChoice!==false)&&(comb.targeting===false)) {
			this.base.changeSprite('arrowR')
			.moveTo(0,0,0);
		} else {
			this.base.changeSprite(' ');
		};
	};
};

// Arrow for targeting 
var targetArrow=function() {
	this.base=rw.ent('targetArrow','menu',' ','png',16,16);
	this.posArray=[['L',48,56],['L',48,104],['L',48,152],['R',208,56],['R',208,104],['R',208,152],['R',256,40],['R',256,88],['R',256,136]];
	this.update=function() {
		var comb=rw.rules['combat'];
		if (comb.targeting!==false) {
			var pos=this.posArray[comb.targeting];
			this.base.changeSprite('arrow'+pos[0]).moveTo(pos[1],pos[2],pos[2]);
		} else {
			this.base.changeSprite(' ');
		};
	};
};

// Hero Hp ent
var hpStat=function(who) {
	this.base=rw.ent('stats_'+who,'',' ','',64,16);
	this.update=function() {
		var comb=rw.rules['combat'];
		var text='HP: '+comb.ppl[who].hp;
		this.base.detach().attach(
			document.createTextNode(text)
		);
	};
};

// Temp Ent for showing Combat Stats
var combatStat=function() {
	this.base=rw.ent('combat','',' ','',320,320);
	this.update=function() {
		var comb=rw.rules['combat'];
		var text='Villan1 HP: '+comb.ppl[3].hp+' Villan2 HP: '+comb.ppl[4].hp;
		if ((comb.isUp[0])||(comb.isUp[0]==0)) text+=' Is Up: '+comb.isUp[0];
		this.base.detach().attach(
			document.createTextNode(text)
		);
	};
};

// Area where hero stats go
var combatBox=function() {
	this.base=rw.ent('combatBox','menu','combatbox','png',320,128);
	this.update=function() {};
};

// Area for one hero's stats
var heroBox=function(who) {
	this.base=rw.ent(who+'_heroBox','menu','herobox','png',288,32);
	this.update=function() {};
};

var loadFight=function() {
	rw.saveState('main').wipeAll()
	.newRule('combat', new combat())
	.newEnt(new combatBox()).base.display('combatbox',0,192,192).end()
	.newEnt(new heroBox('lead')).base.display('herobox',16,208).end()
	.newEnt(new combatHero('0','ranger','M')).base.display('rangerM',16,46,46).end()
	.newEnt(new combatVillan('3','dknight','F')).base.display('dknightF',224,46,46).end()
	.newEnt(new combatVillan('4','dknight','F')).base.display('dknightF',224,94,94).end()
	.newEnt(new selectArrow()).base.display(' ',0,0,0).end()
	.newEnt(new selectMenu()).base.display(' ',96,56,56).end()
	.newEnt(new choiceArrow()).base.display(' ',108,72,72).end()
	.newEnt(new subMenu()).base.display(' ',88,32,160).end()
	.newEnt(new targetArrow()).base.display(' ',0,0,0).end()
	.newEnt(new hpStat(0)).base.display(' ',232,216,216).end()
	.newEnt(new combatStat()).base.display(' ',0,0,0).end();
};


// OVERWORLD STUFF
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
	this.hitMap=[['hero',['wall','villan'],0,2,16,18]];
	this.gotHit=function(by) {
		if (by=='wall') {
			this.base.wipeMove();
		} else if (by=='villan') {
			if (rw.key('s')) {
				rw.atEnd(loadFight);
			};
		};
	};
};

var villan=function() {
	this.base=rw.ent('villan','npc/dknightF','d1','png',16,18);
	this.update=function() {};
	this.hitMap=[['villan',['hero'],0,2,16,18]];
};

var loadMain=function() {
	rw.wipeAll().loadState('main');
};

var gameOver=function() {
	party.lead=new hStat();
	rw.wipeAll().func(createMain());
}

var createMain=function() {
	rw.newMap('map','map01','png',320,320).display().end()
	.newEnt(new hero()).base.display('d1',0,0,0).end()
	.newEnt(new villan()).base.display('d1',32,32,32).end()
	.newEnt(new wall(64,64)).base.display('',16,192,0).end()
	.newEnt(new wall(64,48)).base.display('',144,16,0).end()
	.newEnt(new wall(16,16)).base.display('',144,64,0).end()
	.newEnt(new wall(32,32)).base.display('',208,16,0).end()
	.newEnt(new wall(16,16)).base.display('',208,48,0).end()
	.newEnt(new textThing()).base.display(' ',0,308,308)
	.addChild('0','text',0,0,0,8,12,-64,-24)
	.addChild('1','text',8,0,0,8,12,-72,-48)
	.addChild('2','text',16,0,0,8,12,-8,0);
};

var textLine=function(name,cols,text,x,y,z) {
	var txtEnt=rw.newEnt(new function() {
		this.base=rw.ent(name,'menu',' ','png',cols*8,12);
		this.cols=cols;
		this.update=function() {};
	});
	txtEnt.base.display(' ',x,y,z);
	for (var p=0;p<text.length;p++) {
		txtEnt.base.addChild(p,'text',p*8,0,0,8,12,0,0);
	};
};

var textThing=function() {
	this.base=rw.ent('textthing','menu',' ','png',24,12);
	this.update=function() {
	};
};

var startGame=function() {
	rw.init(320,320)
	.setFPS(40)
	.using('hero/rangerF','png',['u0','u1','u2','d0','d1','d2','l0','l1','l2','r0','r1','r2'])
	.func(createMain())
	.start();
};
