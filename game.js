var items=[
	['mouse',1],
	['fiddle',1],
	['pants',1],
	['ball',1],
	['wall',1],
	['call',1],
	['frog',1],
	['toad',1],
	['rock',1],
	['cowbell',1]
];

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
		['attack','defend',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
		['heal'],
		items
	];
	this.turn=function() {
		var comb=rw.rules['combat'];
		comb.leadUp=true;
		comb.choices=this.choices;
		if (comb.act) {
			if (comb.choice===0) {
				if (comb.subChoice===0) {
					attack(this,comb.ppl[comb.targeting])
				}
			} else if (comb.choice===1) {
				if (Math.random()>0.5) comb.ppl[comb.targeting].hp+=5
			};
			this.turnEnd=true
		}
	}
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
			this.ticker--
		} else {
			this.ticker=40;
			attack(this,rw.rules['combat'].ppl[0]);
			this.turnEnd=true
		}
	}
};

var attack=function(a,t) {
	var roll = (a.att-t.def)+Math.round(Math.random()*100);
	if (roll>=50) {
		t.hp-=a.dam
	};
	if (t.hp<=0) t.alive=false
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
	this.subTop=0;
	this.choices=[];
	this.targeting=false;
	this.act=false;
	this.delay=0;
	this.change=true;
	this.pickChoice=function() {
		if (rw.key('da')) {
			(this.choice<this.choices.length-1) ? this.choice++:this.choice=0;
			this.delay=10;
			this.change=true
		} else if (rw.key('ua')) {
			(this.choice>0) ? this.choice--:this.choice=this.choices.length-1;
			this.delay=10;
			this.change=true
		} else if (rw.key('z')) {
			this.subChoice=0;
			this.delay=10;
			this.change=true
		}
	};
	this.pickSubChoice=function() {
		if (rw.key('da')) {
			if (this.subChoice<this.choices[this.choice].length-1) {
				this.subChoice++;
				if (this.subChoice>this.subTop+7) this.subTop++
			} else {
				this.subChoice=0;
				this.subTop=0
			};
			this.delay=10;
			this.change=true
		} else if (rw.key('ua')) {
			if (this.subChoice) {
				this.subChoice--;
				if (this.subChoice<this.subTop) this.subTop--
			} else {
				this.subChoice=this.choices[this.choice].length-1;
				this.subTop=this.subChoice-7;
				if (this.subTop<0) this.subTop=0
			};
			this.delay=10;
			this.change=true
		} else if (rw.key('z')) {
			this.menu=false;
			this.targeting=2;
			this.nextTarget(true);
			this.delay=10;
			this.subTop=0;
			this.change=true
		} else if (rw.key('x')) {
			this.subChoice=false;
			this.delay=10;
			this.subTop=0;
			this.change=true
		}
	};
	this.nextTarget=function(forward) {
		var newTarget=false;
		var currentTarget=this.targeting;
		if (forward) {
			while (!newTarget) {
				currentTarget++;
				if (currentTarget==this.ppl.length) currentTarget=0;
				if (this.ppl[currentTarget].alive) {
					this.targeting=currentTarget;
					newTarget=true
				};
				if (currentTarget==this.targeting) newTarget=true
			}
		} else {
			while (!newTarget) {
				currentTarget--;
				if (currentTarget==-1) currentTarget=this.ppl.length-1;
				if (this.ppl[currentTarget].alive) {
					this.targeting=currentTarget;
					newTarget=true
				};
				if (currentTarget==this.targeting) newTarget=true
			}
		}
	};
	this.pickTarget=function() {
		if (rw.key('da')) {
			this.nextTarget(true);
			this.delay=10;
			this.change=true
		} else if (rw.key('ua')) {
			this.nextTarget(false);
			this.delay=10;
			this.change=true
		} else if (rw.key('z')) {
			this.act=true;
			this.change=true
		} else if (rw.key('x')) {
			this.targeting=false;
			this.menu=true;
			this.delay=10;
			this.change=true
		}
	};
	this.loopInit=function() {
		for (var x=0;x<this.ppl.length;x++) {
			var psn = this.ppl[x];
			if (psn.alive) {
				if (psn.tInit>0) psn.tInit--;
				if (psn.tInit==0) {
					psn.tInit=psn.init;
					this.isUp.push(x);
					this.change=true;
					this.pause=true
				}
			}
		}
	};
	this.processIsUp=function() {
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
					this.change=true
				}
			} else {
				this.isUp.shift()
			}
		} else {
			this.pause=false
		}
	};
	this.checkVictory=function() {
		var side0=false,side1=false;
		for(var x=0;x<this.ppl.length;x++) {
			var psn=this.ppl[x];
			if (psn.alive) {
				if(psn.side==0) {
					side0=true
				} else {
					side1=true
				}
			}
		};
		if (side0==false) rw.atEnd(gameOver);
		if (side1==false) rw.atEnd(loadMain) // Change this to load get loot screen
	};
	this.rule=function() {
		this.change=false;
		if (this.pause==false) {
			this.loopInit()
		} else {
			this.processIsUp();
			this.checkVictory()
		};
		// Key related stuff
		if (this.delay<1) {
			if ((this.leadUp)||(this.secondUp)||(this.thirdUp)) {
				if ((this.targeting===false)&&(this.menu===false)) {
					this.change=true;
					if (rw.key('z')) {
						this.menu=true;
						this.choice=0;
						this.delay=10
					}
				} else if (this.menu!==false) {
					if (this.subChoice===false) {
						this.pickChoice()
					} else {
						this.pickSubChoice()
					}
				} else if (this.targeting!==false) {
					this.pickTarget()
				}
			}
		} else {
			this.delay--
		}
	}
};

var combatHero=function(num,heroClass,gender) {
	this.base=rw.ent(num+'_combat','combat/hero',heroClass+gender,'png',32,36);
	this.num=num;
	this.update=function() {
	}
};

var combatVillan=function(num,heroClass,gender) {
	this.base=rw.ent(num+'_combat','combat/npc',heroClass+gender,'png',32,36);
	this.num=num;
	this.alive=true;
	this.update=function() {
		var comb=rw.rules['combat'];
		if (comb.change) {
			if ((comb.ppl[this.num].alive==false)&&(this.alive)) {
				this.alive=false;
				this.base.shiftSprite(-32,0)
			}
		}
	}
};

// Arrow for displaying which hero is up
var selectArrow=function() {
	this.base=rw.ent('selectArrow','menu',' ','png',16,16);
	this.update=function() {
		var comb=rw.rules['combat'];
		if (comb.change) {
			if (comb.leadUp) {
				this.base.moveTo(0,56,56);
				this.base.changeSprite('arrowR')
			} else if (comb.secondUp) {
				this.base.moveTo(0,104,104);
				this.base.changeSprite('arrowR')
			} else if (comb.thirdUp) {
				this.base.moveTo(0,152,152);
				this.base.changeSprite('arrowR')
			} else {
				this.base.changeSprite(' ')
			}
		}
	}
};

// Pop-up menu of actions a hero can take
var selectMenu=function() {
	this.base=rw.ent('selectmenu','menu',' ','png',112,80);
	this.update=function() {
		var comb=rw.rules['combat'];
		if (comb.change) {
			if (comb.menu===false) {
				this.base.changeSprite(' ')
			} else {
				this.base.changeSprite('selectmenu')
			}
		}
	}
};

// Arrow for choosing what action to take
var choiceArrow=function() {
	this.base=rw.ent('choicearrow','menu',' ','png',16,16);
	this.update=function() {
		var comb=rw.rules['combat'];
		if (comb.change) {
			if (comb.menu!==false) {
				this.base.changeSprite('arrowR')
				.moveTo(108,72+(16*comb.choice))
			} else {
				this.base.changeSprite(' ')
			}
		}
	}
};

var subMenu=function() {
	this.base=rw.ent('submenu','menu',' ','png',128,128);
	this.update=function() {
		var comb=rw.rules['combat'];
		if (comb.change) {
			if ((comb.subChoice!==false)&&(comb.targeting===false)) {
				this.base.changeSprite('subselectmenu')
			} else {
				this.base.changeSprite(' ')
			}
		}
	}
};

var subArrow=function() {
	this.base=rw.ent('subarrow','menu',' ','png',16,16);
	this.update=function() {
		var comb=rw.rules['combat'];
		if (comb.change) {
			if ((comb.subChoice!==false)&&(comb.targeting===false)) {
				if (comb.choice!=1) {
					var realChoicePos = (comb.subChoice-comb.subTop)*12;
					this.base.changeSprite('arrowR')
					.moveTo(104,48+realChoicePos,161)
				} else {
					this.base.changeSprite(' ')
				}
			} else {
				this.base.changeSprite(' ')
			}
		}
	}
};

// Arrow for targeting 
var targetArrow=function() {
	this.base=rw.ent('targetArrow','menu',' ','png',16,16);
	this.posArray=[['L',48,56],['L',48,104],['L',48,152],['R',208,56],['R',208,104],['R',208,152],['R',256,40],['R',256,88],['R',256,136]];
	this.update=function() {
		var comb=rw.rules['combat'];
		if (comb.change) {
			if (comb.targeting!==false) {
				var pos=this.posArray[comb.targeting];
				this.base.changeSprite('arrow'+pos[0]).moveTo(pos[1],pos[2],pos[2])
			} else {
				this.base.changeSprite(' ')
			}
		}
	}
};

var itemText=function(what) {
	var item=items[what];
	var itemEnt=textLine('itemtext_'+item[0],item[0].length+3,'00-'+item[0],0,320,320,function(){
		var comb=rw.rules['combat'];
		if (comb.change) {
			if ((comb.subChoice!==false)&&(comb.targeting===false)&&(comb.choice==2)) {
				var qty=items[this.what][1];
				if (qty<10) qty=' '+qty;
				var qtyChars=getChars(qty);
				this.base.changeChild(0,'text',-qtyChars[0][0],-qtyChars[0][1]);
				this.base.changeChild(1,'text',-qtyChars[1][0],-qtyChars[1][1]);
				if ((this.what>=comb.subTop)&&(this.what<comb.subTop+8)) {
					this.base.moveTo(120,50+((this.what-comb.subTop)*12),161)
				} else {
					this.base.moveTo(0,320,320)
				}
			} else {
				this.base.moveTo(0,320,320)
			}
		}
	}, function(){
	});
	itemEnt.what=what
};

// Shows a person's remaining hp
var hpStat=function(who,x,y) {
	var hpEnt=textLine('hpstat_'+who,7,'HP:    ',x,y,y,function(){
		var comb=rw.rules['combat'];
		if (comb.change) {
			var psn=this.who;
			var hp=comb.ppl[this.who].hp+'';
			while (hp.length<3) {
				hp=' '+hp
			};
			var hpChars=getChars(hp);
			this.base.changeChild(4,'text',-hpChars[0][0],-hpChars[0][1]);
			this.base.changeChild(5,'text',-hpChars[1][0],-hpChars[1][1]);
			this.base.changeChild(6,'text',-hpChars[2][0],-hpChars[2][1])
		}
	});
	hpEnt.who=who
};


// Area where hero stats go
var combatBox=function() {
	this.base=rw.ent('combatBox','menu','combatbox','png',320,128);
	this.update=function() {}
};

// Area for one hero's stats
var heroBox=function(who) {
	this.base=rw.ent(who+'_heroBox','menu','herobox','png',288,32);
	this.update=function() {}
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
	.newEnt(new subArrow()).base.display(' ',0,0,0).end()
	.newEnt(new targetArrow()).base.display(' ',0,0,0).end()
	.func(hpStat(0,236,220))
	.func(hpStat(3,0,0))
	.func(hpStat(4,80,0))
	.func(itemText(0))
	.func(itemText(1))
	.func(itemText(2))
	.func(itemText(3))
	.func(itemText(4))
	.func(itemText(5))
	.func(itemText(6))
	.func(itemText(7))
	.func(itemText(8))
	.func(itemText(9))
};


// OVERWORLD STUFF
var wallCount=0;
var wall=function(x,y) {
	this.base=rw.ent('wall'+wallCount++,'','','',x,y);
	this.update=function() {};
	this.hitMap=[['wall',['hero'],0,0,x,y]]
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
			this.dir='u'
		} else if (rw.key('da')) {
			this.base.move(0,0.5);
			moving=true;
			this.dir='d'
		} else if (rw.key('la')) {
			this.base.move(-0.5,0);
			moving=true;
			this.dir='l'
		} else if (rw.key('ra')) {
			this.base.move(0.5,0);
			moving=true;
			this.dir='r'
		};
		if(moving) {
			if (this.moveCount<8) {
				this.moveCount++
			} else {
				this.moveCount=0;
				if (this.moveDir==false) {
					if (this.ani<2) {
						this.ani++
					} else {
						this.ani--;
						this.moveDir=true
					};
				} else {
					if (this.ani>0) {
						this.ani--
					} else {
						this.ani++;
						this.moveDir=false
					}
				}
			}
		};
		this.base.changeSprite(this.dir+this.ani)
	};
	this.hitMap=[['hero',['wall','villan'],0,2,16,18]];
	this.gotHit=function(by) {
		if (by=='wall') {
			this.base.wipeMove()
		} else if (by=='villan') {
			if (rw.key('s')) {
				rw.atEnd(loadFight)
			}
		}
	}
};

var villan=function() {
	this.base=rw.ent('villan','npc/dknightF','d1','png',16,18);
	this.update=function() {};
	this.hitMap=[['villan',['hero'],0,2,16,18]]
};

var loadMain=function() {
	rw.wipeAll().loadState('main')
};

var gameOver=function() {
	party.lead=new hStat();
	rw.wipeAll().func(createMain())
};

var createMain=function() {
	rw.newMap('map','map01','png',320,320).display().end()
	.newEnt(new hero()).base.display('d1',0,0,0).end()
	.newEnt(new villan()).base.display('d1',32,32,32).end()
	.newEnt(new wall(64,64)).base.display('',16,192,0).end()
	.newEnt(new wall(64,48)).base.display('',144,16,0).end()
	.newEnt(new wall(16,16)).base.display('',144,64,0).end()
	.newEnt(new wall(32,32)).base.display('',208,16,0).end()
	.newEnt(new wall(16,16)).base.display('',208,48,0).end()
	.func(textLine('test',16,'Arrg! Hi whirld?',0,308,308,function(){
		this.base.move(1,0)
	}
	))
};


var alp=[
	[' ','!','"','#','$','%','&',"'",'(',')','*','+',',','-','.','/'],
	['0','1','2','3','4','5','6','7','8','9',':',';','<','=','>','?'],
	['@','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O'],
	['P','Q','R','S','T','U','V','W','X','Y','Z','[','\\',']','^','_'],
	['`','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o'],
	['p','q','r','s','t','u','v','w','x','y','z','{','|','}','~','']
];

var getChars=function(text) {
	var hpChars=[];
	for (var p=0;p<text.length;p++) {
		for (var q=0;q<alp.length;q++) {
			var row=alp[q];
			for (var r=0;r<row.length;r++) {
				if (row[r]===text[p]) {
					hpChars[p]=[r*8,q*12]
				}
			}
		}
	};
	return hpChars
};

var textLine=function(name,cols,text,x,y,z,update,inactive) {
	var txtEnt=rw.newEnt(new function() {
		this.base=rw.ent(name,'menu',' ','png',cols*8,12);
		this.cols=cols;
		this.update=update||function(){};
		this,inactive=inactive||function(){}
	});
	txtEnt.base.display(' ',x,y,z);
	for (var p=0;p<text.length;p++) {
		for (var q=0;q<alp.length;q++) {
			var row=alp[q];
			for (var r=0;r<row.length;r++) {
				if (row[r]===text[p]) {
					var pos=[r*8,q*12]
				}
			}
		};
		txtEnt.base.addChild(p,'text',p*8,0,0,8,12,-pos[0],-pos[1])
	};
	return txtEnt
};

var startGame=function() {
	rw.init(320,320)
	.setFPS(40)
	.using('hero/rangerF','png',['u0','u1','u2','d0','d1','d2','l0','l1','l2','r0','r1','r2'])
	.func(createMain())
	.start()
};
