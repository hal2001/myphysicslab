// Copyright 2016 Erik Neumann.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('myphysicslab.sims.springs.Molecule3App');

goog.require('myphysicslab.lab.controls.SliderControl');
goog.require('myphysicslab.lab.model.CollisionAdvance');
goog.require('myphysicslab.lab.model.PointMass');
goog.require('myphysicslab.lab.util.Observer');
goog.require('myphysicslab.lab.model.SimObject');
goog.require('myphysicslab.lab.model.Spring');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.ParameterNumber');
goog.require('myphysicslab.lab.util.Util');
goog.require('myphysicslab.lab.view.DisplayShape');
goog.require('myphysicslab.lab.view.DisplaySpring');
goog.require('myphysicslab.sims.common.AbstractApp');
goog.require('myphysicslab.sims.common.CommonControls');
goog.require('myphysicslab.sims.common.TabLayout');
goog.require('myphysicslab.sims.springs.Molecule3Sim');
goog.require('myphysicslab.lab.model.SimList');

goog.scope(function() {

var lab = myphysicslab.lab;
var sims = myphysicslab.sims;

var AbstractApp = sims.common.AbstractApp;
var CollisionAdvance = lab.model.CollisionAdvance;
var CommonControls = sims.common.CommonControls;
var DisplayShape = lab.view.DisplayShape;
var DisplaySpring = myphysicslab.lab.view.DisplaySpring;
var DoubleRect = lab.util.DoubleRect;
var Molecule3Sim = sims.springs.Molecule3Sim;
var Observer = lab.util.Observer;
var ParameterNumber = lab.util.ParameterNumber;
var PointMass = lab.model.PointMass;
var SimList = lab.model.SimList;
var SimObject = lab.model.SimObject;
var SliderControl = lab.controls.SliderControl;
var Spring = myphysicslab.lab.model.Spring;
var TabLayout = sims.common.TabLayout;
var Util = lab.util.Util;

/** Displays the {@link Molecule3Sim} simulation.

* @param {!TabLayout.elementIds} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
* @param {number} numAtoms number of atoms to make, from 2 to 6
* @constructor
* @final
* @implements {Observer}
* @extends {AbstractApp}
* @struct
* @export
*/
myphysicslab.sims.springs.Molecule3App = function(elem_ids, numAtoms) {
  Util.setErrorHandler();
  /** @type {number} */
  this.numAtoms = numAtoms;
  var simRect = new DoubleRect(-6, -6, 6, 6);
  var sim = new Molecule3Sim();
  var advance = new CollisionAdvance(sim);
  AbstractApp.call(this, elem_ids, simRect, sim, advance, /*eventHandler=*/sim,
      /*energySystem=*/sim);
  this.layout.simCanvas.setBackground('black');

  /** @type {!DisplaySpring} */
  this.protoSpring = new DisplaySpring().setWidth(0.3).setColorCompressed('#0c0')
      .setColorExpanded('green').setThickness(3);
  /** @type {!DisplaySpring} */
  this.protoSpecialSpring = new DisplaySpring().setWidth(0.3).setColorCompressed('#c00')
      .setColorExpanded('red').setThickness(3);

  // The observe() method will make DisplayObjects in response to seeing SimObjects
  // being added to the SimList.  Important that no SimObjects were added prior.
  goog.asserts.assert(this.simList.length() == 0);
  this.simList.addObserver(this);
  sim.config(numAtoms);

  this.addPlaybackControls();
  /** @type {!ParameterNumber} */
  var pn;
  pn = sim.getParameterNumber(Molecule3Sim.en.GRAVITY);
  this.addControl(new SliderControl(pn, 0, 20, /*multiply=*/false));

  pn = sim.getParameterNumber(Molecule3Sim.en.DAMPING);
  this.addControl(new SliderControl(pn, 0, 1, /*multiply=*/false));

  pn = sim.getParameterNumber(Molecule3Sim.en.ELASTICITY);
  this.addControl(new SliderControl(pn, 0, 1, /*multiply=*/false));

  pn = sim.getParameterNumber(Molecule3Sim.en.MASS);
  this.addControl(new SliderControl(pn, 0.2, 20.2, /*multiply=*/true));

  pn = sim.getParameterNumber(Molecule3Sim.en.MASS_SPECIAL);
  this.addControl(new SliderControl(pn, 0.2, 20.2, /*multiply=*/true));

  pn = sim.getParameterNumber(Molecule3Sim.en.LENGTH);
  this.addControl(new SliderControl(pn, 0.1, 10.1, /*multiply=*/true));

  pn = sim.getParameterNumber(Molecule3Sim.en.LENGTH_SPECIAL);
  this.addControl(new SliderControl(pn, 0.1, 10.1, /*multiply=*/true));

  pn = sim.getParameterNumber(Molecule3Sim.en.STIFFNESS);
  this.addControl(new SliderControl(pn, 0, 100, /*multiply=*/false));

  pn = sim.getParameterNumber(Molecule3Sim.en.STIFFNESS_SPECIAL);
  this.addControl(new SliderControl(pn, 0, 100, /*multiply=*/false));

  this.addStandardControls();

  this.makeEasyScript();
  this.addURLScriptButton();
};
var Molecule3App = myphysicslab.sims.springs.Molecule3App;
goog.inherits(Molecule3App, AbstractApp);

if (!Util.ADVANCED) {
  /** @inheritDoc */
  Molecule3App.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        + Molecule3App.superClass_.toString.call(this);
  };
};

/** @inheritDoc */
Molecule3App.prototype.getClassName = function() {
  return 'Molecule3App';
};

/** @inheritDoc */
Molecule3App.prototype.defineNames = function(myName) {
  Molecule3App.superClass_.defineNames.call(this, myName);
  this.terminal.addRegex('protoSpecialSpring|protoSpring', myName);
};

/**
@param {!SimObject} obj
@private
*/
Molecule3App.prototype.addBody = function(obj) {
  if (this.displayList.find(obj) != null) {
    // we already have a DisplayObject for this SimObject, don't add a new one.
    return;
  }
  if (obj instanceof PointMass) {
    var pm = /** @type {!PointMass} */(obj);
    if (pm.getName().match(/^WALL/)) {
    var walls = new DisplayShape(pm).setFillStyle('').setStrokeStyle('gray');
    this.displayList.add(walls);
    } else {
      var cm = 'black';
      switch (pm.getName()) {
        case 'ATOM1': cm = 'red'; break;
        case 'ATOM2': cm = 'blue'; break;
        case 'ATOM3': cm = 'magenta'; break;
        case 'ATOM4': cm = 'orange'; break;
        case 'ATOM5': cm = 'gray'; break;
        case 'ATOM6': cm = 'green'; break;
        default: throw new Error();
      }
      var atom = new DisplayShape(pm).setFillStyle(cm);
      this.displayList.add(atom);
    }
  } else if (obj instanceof Spring) {
    var s = /** @type {!Spring} */(obj);
    var proto = s.getName().match(/^SPECIAL/) ? this.protoSpecialSpring :
        this.protoSpring;
    this.displayList.add(new DisplaySpring(s, proto));
  }
};

/** @inheritDoc */
Molecule3App.prototype.observe =  function(event) {
  if (event.getSubject() == this.simList) {
    var obj = /** @type {!SimObject} */ (event.getValue());
    if (event.nameEquals(SimList.OBJECT_ADDED)) {
      this.addBody(obj);
    } else if (event.nameEquals(SimList.OBJECT_REMOVED)) {
      var d = this.displayList.find(obj);
      if (d != null) {
        this.displayList.remove(d);
      }
    }
  }
};

}); // goog.scope
