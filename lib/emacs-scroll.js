'use babel';

import EmacsScrollView from './emacs-scroll-view';
import { CompositeDisposable } from 'atom';
import {jQuery} from 'atom-space-pen-views';
export default {

  emacsScrollView: null,
  modalPanel: null,
  subscriptions: null,

  currentEditor: null,
  disposeCurrentEditor: null,
  activate(state) {
    this.emacsScrollView = new EmacsScrollView(state.emacsScrollViewState);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'emacs-scroll: screen-up': () => this.scrollUp(),
      'emacs-scroll: screen-down': () => this.scrollDown(),
    }));


    this.disposeCurrentEditor =
      atom.workspace.onDidChangeActiveTextEditor(this.onEditorChange);
  },

  deactivate() {
    this.subscriptions.dispose();
    this.emacsScrollView.destroy();
    this.disposeCurrentEditor.destroy();
  },

  serialize() {
    return {
      emacsScrollViewState: this.emacsScrollView.serialize()
    };
  },

  onEditorChange(editor) {
    this.currentEditor = editor;
  },

  /**
   * alt-v: scroll up
   * @return null
   */
  scrollUp(){
    // 1. scroll down screen
    // 2. middle position the cursor
    if (!this.currentEditor) {
      this.currentEditor = atom.workspace.getActiveTextEditor();
    }
    // scroll the view
    let view = atom.views.getView(this.currentEditor);
    this.animateScroll(
      view.getScrollTop(),
      view.getScrollTop() - view.getHeight()/2,
      this.currentEditor
    );
  },

  /**
   * ctrl-v: scroll down
   * @return null
   */
  scrollDown(){
    // 1. scroll down screen
    // 2. middle position the cursor
    if (!this.currentEditor) {
      this.currentEditor = atom.workspace.getActiveTextEditor();
    }
    // scroll the view
    let view = atom.views.getView(this.currentEditor);
    this.animateScroll(
      view.getScrollTop(),
      view.getScrollTop() + view.getHeight()/2,
      this.currentEditor
    );
  },

  /**
   * position curor at center of screen
   * @return null
   */
  helperPutCursorCenter(){
    let cursorXY = this.currentEditor.getVisibleRowRange();
    let targetXY = [cursorXY[0] + 0.5 * (cursorXY[1] - cursorXY[0]), 0];
    this.currentEditor.setCursorScreenPosition(targetXY);
  },

  animateScroll(from, to, editorElement){
    jQuery({top: from}).animate(
      {
        top: to
      },
      {
        duration: 500,
        easing: "swing",
        step: (currentStep) => {
          editorElement.setScrollTop(currentStep);
        },
        complete: () => {
          this.helperPutCursorCenter();
        },
      }
    );
  }
};
