import React              from 'react';
import annotations        from 'emoji-annotation-to-unicode';
import emoticons          from 'emoji-emoticon-to-unicode';
import escapeStringRegexp from 'escape-string-regexp';
import assign             from 'object-assign';
import compact            from 'lodash.compact';



let ReactEmoji = () => {
  let getEscapedKeys = (hash) => {
    return Object.keys(hash)
      .map(x => escapeStringRegexp(x))
      .join('|');
  };

  let buildOptions = (options) => {
    let hash = {
      useEmoticon: options.useEmoticon === false ? false : true,
      emojiType: options.emojiType || 'twemoji',
      host: options.host || '',
      path: options.path || '',
      ext: options.ext || 'svg',
      singleEmoji: options.singleEmoji || false,
      strict: options.strict || false,
      size: options.size || '20px'
    };
    hash.attributes = assign({width: hash.size, height: hash.size}, options.attributes);
    return hash;
  };

  // Use negated lookahead for `:/`, refs: https://github.com/banyan/react-emoji/issues/1
  let specialEmoticons = {':/': '1f615'};
  let specialEmoticonsRegex = "\\:\\/(?!\\/)";
  let urlSuppliedRegex = "\\:URL\\|.*\\|URL\\:"

  const emojiWithEmoticons = {
    delimiter: new RegExp(`(:(?:${getEscapedKeys(annotations)}):|${getEscapedKeys(emoticons)}|${specialEmoticonsRegex}|${urlSuppliedRegex})`, 'g'),
    dict: assign(annotations, emoticons, specialEmoticons)
  };

  const emojiWithoutEmoticons = {
    delimiter: new RegExp(`(:(?:${getEscapedKeys(annotations)}):)`, 'g'),
    dict: annotations
  };

  let buildImageUrl = (hex, options) => {
    if (options.host) {
      return compact([options.host, options.path, `${hex}.${options.ext}`]).join('/');
    } else if (options.emojiType === 'twemoji') {
      return `https://twemoji.maxcdn.com/${options.ext}/${hex}.${options.ext}`;
    } else if (options.emojiType === 'emojione') {
      return `http://cdn.jsdelivr.net/emojione/assets/${options.ext}/${hex.toUpperCase()}.${options.ext}`;
    } else {
      throw new Error('Invalid emojiType is passed');
    }
  };

  let getKey = (key) => {
    if (key.match(/^:.*:$/)) {
      return key.replace(/^:/, '').replace(/:$/, '');
    } else {
      return key;
    }
  };

  let emojifyTextToSingleEmoji = (text, options) => {
    let { dict } = options.useEmoticon ? emojiWithEmoticons : emojiWithoutEmoticons;
    let hex = dict[getKey(text)];
    if (!!options.strict && !hex) throw new Error(`Could not find emoji: ${text}.`);
    if (!hex) return text;
    return React.createElement(
      'img',
      assign(options.attributes, {
        src: buildImageUrl(hex, options)
      })
    );
  };

  let emojifyText = (text, options) => {
    let { delimiter, dict } = options.useEmoticon ? emojiWithEmoticons : emojiWithoutEmoticons;
    return compact(
      text.split(delimiter).map(function(word, index) {

        // console.log('HEY WORD', delimiter, word);
        let match = word.match(delimiter);
        if (!!options.strict && word !== '' && match === null) throw new Error(`Could not find emoji: ${word}.`);
        if (word === ':props:'){
          return React.createElement(
            'img',
            assign(options.attributes, {
              key: index,
              src: 'https://s3.amazonaws.com/props-media/emoji/props_72.png'
            })
          );
        }
        else if(word.indexOf(':URL|') >-1 && word.indexOf('|URL:') >-1){
         return React.createElement(
            'img',
            assign(options.attributes, {
              key: index,
              src: word.replace(':URL|', '').replace('|URL:', '')
            })
          ); 
        }
        else if (match) {
          let hex = dict[getKey(match[0])];
          if (hex === null) return word;
          return React.createElement(
            'img',
            assign(options.attributes, {
              key: index,
              src: buildImageUrl(hex, options)
            })
          ); 
        } else {

          return word;
        }
      })
    );
  };

  return {
    emojify(text, options = {}) {
      if (!text) return null;
      options = buildOptions(options);
      if (options.singleEmoji) {
        return emojifyTextToSingleEmoji(text, options);
      } else {
        return emojifyText(text, options);
      }
    },
  };
};

export default ReactEmoji();
