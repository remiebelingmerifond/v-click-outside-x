import PACKAGE_JSON from 'RootDir/package';
import * as vcos from 'src/v-click-outside-x';
import * as vcod from 'dist/v-click-outside-x';

const doc = window.document;

[vcos, vcod].forEach(({directive, install}, testNum) => {
  describe(`vClickOutside ${testNum}`, () => {
    beforeEach(() => {
      doc.addEventListener = jest.fn();
      doc.removeEventListener = jest.fn();
    });

    afterEach(() => {
      doc.addEventListener = undefined;
      doc.removeEventListener = undefined;
    });

    describe('plugin', () => {
      it('the directive is an object', () => {
        expect.assertions(1);

        expect(directive).toBeInstanceOf(Object);
      });

      it('it has all hook functions available', () => {
        expect.assertions(2);

        ['bind', 'unbind'].forEach((functionName) => {
          expect(directive[functionName]).toBeInstanceOf(Function);
        });
      });

      it('$captureInstances is an empty Object', () => {
        expect.assertions(1);

        expect(Object.keys(directive.$captureInstances)).toHaveLength(0);
      });

      it('$nonCaptureInstances is an empty Object', () => {
        expect.assertions(1);

        expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(0);
      });

      it('$captureEventHandlers an empty Object', () => {
        expect.assertions(1);

        expect(Object.keys(directive.$captureEventHandlers)).toHaveLength(0);
      });

      it('$nonCaptureEventHandlers an empty Object', () => {
        expect.assertions(1);

        expect(Object.keys(directive.$nonCaptureEventHandlers)).toHaveLength(0);
      });

      it('version to be a string', () => {
        expect.assertions(1);

        expect(typeof directive.version).toStrictEqual('string');
      });

      it('version to be as per package.json', () => {
        expect.assertions(1);

        expect(directive.version).toStrictEqual(PACKAGE_JSON.version);
      });

      it('version to be enumerable', () => {
        expect.assertions(1);

        expect(Object.prototype.propertyIsEnumerable.call(directive, 'version')).toBe(true);
      });

      it('install the directive into the vue instance', () => {
        expect.assertions(2);

        const vue = {
          directive: jest.fn(),
        };

        install(vue);

        expect(vue.directive).toHaveBeenCalledWith('click-outside', directive);
        expect(vue.directive).toHaveBeenCalledTimes(1);
      });
    });

    describe('directive', () => {
      describe('bind/unbind', () => {
        describe('bind exceptions', () => {
          it('throws an error if value is not a function', () => {
            expect.assertions(1);

            const div1 = doc.createElement('div');

            const bindWithNoFunction = () => directive.bind(div1, {});

            expect(bindWithNoFunction).toThrowErrorMatchingSnapshot();
          });
        });

        describe('single', () => {
          const div1 = doc.createElement('div');

          it('adds to the list and event listener', () => {
            expect.assertions(6);

            const eventHandler = jest.fn();

            directive.bind(div1, {value: eventHandler});

            expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(1);
            expect(directive.$nonCaptureInstances).toHaveProperty('click');

            const clickInstances = directive.$nonCaptureInstances.click;

            expect(clickInstances).toBeInstanceOf(Array);
            expect(clickInstances).toHaveLength(1);
            expect(clickInstances.find((item) => item.el === div1)).toBeDefined();
            expect(doc.addEventListener.mock.calls).toHaveLength(1);
          });

          it('removes from the list and event listener', () => {
            expect.assertions(2);

            directive.unbind(div1);

            expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(0);
            expect(doc.removeEventListener.mock.calls).toHaveLength(1);
          });
        });

        describe('multiple', () => {
          const div1 = doc.createElement('div');
          const div2 = doc.createElement('div');

          it('adds to the list and event listener', () => {
            expect.assertions(7);

            const eventHandler1 = jest.fn();
            const eventHandler2 = jest.fn();

            directive.bind(div1, {value: eventHandler1});
            directive.bind(div2, {arg: 'click', value: eventHandler2});

            expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(1);
            expect(directive.$nonCaptureInstances).toHaveProperty('click');

            const clickInstances = directive.$nonCaptureInstances.click;

            expect(clickInstances).toBeInstanceOf(Array);
            expect(clickInstances).toHaveLength(2);

            expect(clickInstances.find((item) => item.el === div1)).toBeDefined();
            expect(clickInstances.find((item) => item.el === div2)).toBeDefined();
            expect(doc.addEventListener.mock.calls).toHaveLength(1);
          });

          it('removes from the list and the event listener', () => {
            expect.assertions(7);

            directive.unbind(div1);

            expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(1);
            expect(directive.$nonCaptureInstances).toHaveProperty('click');

            const clickInstances = directive.$nonCaptureInstances.click;

            expect(clickInstances).toBeInstanceOf(Array);
            expect(clickInstances).toHaveLength(1);
            expect(clickInstances.find((item) => item.el === div2)).toBeDefined();

            directive.unbind(div2);

            expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(0);

            expect(doc.removeEventListener.mock.calls).toHaveLength(1);
          });
        });

        describe('bind', () => {
          it('saves the instance binding and element', () => {
            expect.assertions(13);

            const div1 = doc.createElement('div');
            const div2 = doc.createElement('div');
            const div3 = doc.createElement('div');
            const eventHandler1 = jest.fn();
            const eventHandler2 = jest.fn();

            directive.bind(div1, {
              arg: 'pointerdown',
              modifiers: {capture: true},
              value: eventHandler1,
            });
            directive.bind(div2, {
              arg: 'pointerdown',
              modifiers: {stop: true},
              value: eventHandler2,
            });
            directive.bind(div3, {
              arg: 'pointerdown',
              modifiers: {prevent: true},
              value: eventHandler2,
            });

            expect(Object.keys(directive.$captureInstances)).toHaveLength(1);
            expect(directive.$captureInstances).toHaveProperty('pointerdown');

            const clickCaptureInstances = directive.$captureInstances.pointerdown;

            expect(clickCaptureInstances).toBeInstanceOf(Array);
            expect(clickCaptureInstances).toHaveLength(1);

            expect(clickCaptureInstances.find((item) => item.el === div1)).toStrictEqual({
              binding: {
                arg: 'pointerdown',
                modifiers: {
                  capture: true,
                  prevent: false,
                  stop: false,
                },
                value: eventHandler1,
              },
              el: div1,
            });

            expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(1);
            expect(directive.$nonCaptureInstances).toHaveProperty('pointerdown');

            const clickNonCaptureInstances = directive.$nonCaptureInstances.pointerdown;

            expect(clickNonCaptureInstances).toBeInstanceOf(Array);
            expect(clickNonCaptureInstances).toHaveLength(2);

            expect(clickNonCaptureInstances.find((item) => item.el === div2)).toStrictEqual({
              binding: {
                arg: 'pointerdown',
                modifiers: {
                  capture: false,
                  prevent: false,
                  stop: true,
                },
                value: eventHandler2,
              },
              el: div1,
            });

            expect(clickNonCaptureInstances.find((item) => item.el === div3)).toStrictEqual({
              binding: {
                arg: 'pointerdown',
                modifiers: {
                  capture: false,
                  prevent: true,
                  stop: false,
                },
                value: eventHandler2,
              },
              el: div1,
            });

            directive.unbind(div1);
            directive.unbind(div2);
            directive.unbind(div3);

            expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(0);
            expect(Object.keys(directive.$captureInstances)).toHaveLength(0);
          });
        });
      });

      describe('eventHandlers', () => {
        const div1 = doc.createElement('div');
        const span = doc.createElement('span');
        div1.appendChild(span);

        it('calls the callback if the element is not the same and does not contain the event target', () => {
          expect.assertions(12);

          const a = doc.createElement('a');
          const event = {
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
            target: a,
          };

          const eventHandler1 = jest.fn();

          directive.bind(div1, {value: eventHandler1});
          directive.$nonCaptureEventHandlers.click(event);

          expect(eventHandler1).toHaveBeenCalledWith(event);
          expect(eventHandler1.mock.instances).toHaveLength(1);

          expect(event.preventDefault).not.toHaveBeenCalled();
          expect(event.stopPropagation).not.toHaveBeenCalled();

          directive.unbind(div1);
          expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(0);
          expect(Object.keys(directive.$captureInstances)).toHaveLength(0);

          const eventHandler2 = jest.fn();

          directive.bind(div1, {
            arg: 'touchdown',
            modifiers: {capture: true, prevent: true, stop: true},
            value: eventHandler2,
          });
          directive.$captureEventHandlers.touchdown(event);

          expect(eventHandler2).toHaveBeenCalledWith(event);
          expect(eventHandler2.mock.instances).toHaveLength(1);

          expect(event.preventDefault).toHaveBeenCalled();
          expect(event.stopPropagation).toHaveBeenCalled();

          directive.unbind(div1);
          expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(0);
          expect(Object.keys(directive.$captureInstances)).toHaveLength(0);
        });

        it('does not execute the callback if the event target its the element from the instance', () => {
          expect.assertions(4);

          const event = {
            target: div1,
          };

          const eventHandler = jest.fn();

          directive.bind(div1, {value: eventHandler});
          directive.$nonCaptureEventHandlers.click(event);

          expect(eventHandler).not.toHaveBeenCalled();
          expect(eventHandler.mock.instances).toHaveLength(0);

          directive.unbind(div1);
          expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(0);
          expect(Object.keys(directive.$captureInstances)).toHaveLength(0);
        });

        it('does not execute the callback if the event target is contained in the element from the instance', () => {
          expect.assertions(4);

          const event = {
            target: span,
          };

          const eventHandler = jest.fn();

          directive.bind(div1, {value: eventHandler});
          directive.$nonCaptureEventHandlers.click(event);

          expect(eventHandler).not.toHaveBeenCalled();
          expect(eventHandler.mock.instances).toHaveLength(0);

          directive.unbind(div1);
          expect(Object.keys(directive.$nonCaptureInstances)).toHaveLength(0);
          expect(Object.keys(directive.$captureInstances)).toHaveLength(0);
        });
      });
    });
  });
});
