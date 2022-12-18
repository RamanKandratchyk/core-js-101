/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const res = JSON.parse(json);
  Object.setPrototypeOf(res, proto);
  return res;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = {
  validArr: [],

  SelectorClassConstructor(method, value) {
    return class {
      constructor() {
        this.method = method;
        this.value = value;
        this.classResStr = '';
        cssSelectorBuilder.validArr.length = 0;
        this.sampleOccur = ['element', 'id', 'pseudoElement'];
        this.sampleOrder = [
          'element',
          'id',
          'class',
          'attr',
          'pseudoClass',
          'pseudoElement',
        ];
        this[this.method](this.value);
      }

      validArrCheck(arr) {
        this.sampleOccur.forEach((item) => {
          if (arr.indexOf(item) !== arr.lastIndexOf(item)) {
            throw new Error(
              'Element, id and pseudo-element should not occur more then one time inside the selector',
            );
          }
        });

        this.sampleOrder.forEach((item, idx, initArr) => {
          initArr.slice(idx).forEach((sliceEl) => {
            if (
              arr.indexOf(sliceEl) !== -1
              && arr.indexOf(item) > arr.indexOf(sliceEl)
            ) {
              throw new Error(
                'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
              );
            }
          });
        });
      }

      element(str) {
        this.classResStr += str;
        cssSelectorBuilder.validArr.push('element');
        this.validArrCheck(cssSelectorBuilder.validArr);
        return this;
      }

      id(str) {
        this.classResStr += `#${str}`;
        cssSelectorBuilder.validArr.push('id');
        this.validArrCheck(cssSelectorBuilder.validArr);
        return this;
      }

      class(str) {
        this.classResStr += `.${str}`;
        cssSelectorBuilder.validArr.push('class');
        this.validArrCheck(cssSelectorBuilder.validArr);
        return this;
      }

      attr(str) {
        this.classResStr += `[${str}]`;
        cssSelectorBuilder.validArr.push('attr');
        this.validArrCheck(cssSelectorBuilder.validArr);
        return this;
      }

      pseudoClass(str) {
        this.classResStr += `:${str}`;
        cssSelectorBuilder.validArr.push('pseudoClass');
        this.validArrCheck(cssSelectorBuilder.validArr);
        return this;
      }

      pseudoElement(str) {
        this.classResStr += `::${str}`;
        cssSelectorBuilder.validArr.push('pseudoElement');
        this.validArrCheck(cssSelectorBuilder.validArr);
        return this;
      }

      stringify() {
        return this.classResStr;
      }
    };
  },

  CombineClassConstructor(selector1, combinator, selector2) {
    return class {
      constructor() {
        this.selector1 = selector1;
        this.combinator = combinator;
        this.selector2 = selector2;
        this.combResStr = '';
        this.combine(this.selector1, this.combinator, this.selector2);
      }

      combine(sel1, comb, sel2) {
        if (sel1.classResStr) {
          this.combResStr += sel1.classResStr;
        } else {
          this.combResStr += sel1.combResStr;
        }

        this.combResStr += ` ${comb} `;

        if (sel2.classResStr) {
          this.combResStr += sel2.classResStr;
        } else {
          this.combResStr += sel2.combResStr;
        }
        return this;
      }

      stringify() {
        return this.combResStr;
      }
    };
  },

  // ****************************************

  element(value) {
    const ElementClass = this.SelectorClassConstructor('element', value);
    return new ElementClass();
  },

  id(value) {
    const IdClass = this.SelectorClassConstructor('id', value);
    return new IdClass();
  },

  class(value) {
    const ClassClass = this.SelectorClassConstructor('class', value);
    return new ClassClass();
  },

  attr(value) {
    const AttrClass = this.SelectorClassConstructor('attr', value);
    return new AttrClass();
  },

  pseudoClass(value) {
    const PseudoClassClass = this.SelectorClassConstructor(
      'pseudoClass',
      value,
    );
    return new PseudoClassClass();
  },

  pseudoElement(value) {
    const PseudoElementClass = this.SelectorClassConstructor(
      'pseudoElement',
      value,
    );
    return new PseudoElementClass();
  },

  combine(selector1, combinator, selector2) {
    const CombineClass = this.CombineClassConstructor(
      selector1,
      combinator,
      selector2,
    );
    return new CombineClass();
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
