import 'babel-core/polyfill';
import React  from 'react';
import ReactEmojiMixin from '../src/react-emoji';

let App = React.createClass({
  getDefaultProps() {
    return {
      text: "hi I'm happy :smile: :100: :+1: http://yahoo.co.jp :arrow_double_down: hey yo :props: yal"
    };
  },

  mixins: [
    ReactEmojiMixin
  ],

  render() {

    var urlReplacement = 'Here is a custom emoji! :URL|https://propsboard.slack.com/emoji/metal/9f936a4278.png|URL:'

    return (
      <div>
        <div>{ this.emojify(this.props.text) }</div>
        <div>{ this.emojify(urlReplacement) }</div>
        <div>{ this.emojify(this.props.text, {size: '40px' }) }</div>
        <div>{ this.emojify(this.props.text, {emojiType: 'emojione'}) }</div>
        <div>{ this.emojify(this.props.text, {useEmoticon: false}) }</div>
      </div>
    );
  }
});

React.render(<App />, document.getElementById('app'));
