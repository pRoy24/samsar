import React, { useEffect , useState} from 'react';
import ace from 'ace-builds';
import AceEditor from 'react-ace';
import TextareaAutosize from 'react-textarea-autosize';
import { useColorMode } from '../../../contexts/ColorMode.js';
import SecondaryButton from '../../common/SecondaryButton.tsx';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';

import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';


ace.config.set('useWorker', false);

export default function VideoEditorDefaultsViewer(props) {
  const {
    parentJsonTheme,

    basicTextTheme,
    derivedJsonTheme,
    submitUpdateSessionDefaults,
    defaultSceneDuration,

  } = props;

  const { colorMode } = useColorMode();

  const [ themeType, setThemeType ] = useState('basic');
  const [ themeJson, setThemeJson ] = useState('');

  useEffect(() => {
    if (derivedJsonTheme) {
      setThemeType('derivedJson');
      setThemeJson(derivedJsonTheme);
    } else if (parentJsonTheme) {
      setThemeType('parentJson');
      setThemeJson(parentJsonTheme);
    } else if (basicTextTheme) {
      setThemeType('basic');
    }

  }, []);



  let themeDisplayBody = <span />;


  let bgColor = "bg-cyber-black border-blue-900";
  if (colorMode === 'light') {
    bgColor = "bg-neutral-50 text-neutral-900";
  }

  let buttonBgcolor = "bg-gray-900 text-white";
  if (colorMode === 'light') {
    buttonBgcolor = "bg-stone-200 text-neutral-900";
  }

  const text2Color = colorMode === 'dark' ? 'text-neutral-100' : 'text-neutral-900';



  const handleJsonThemeChange = (value) => {

    setThemeJson(value);
  }

  const submitUpdateSessionDefaultsWithType = (evt) => {
    evt.preventDefault();
    let theme = '';
    let payload = {}
    if (themeType === 'derivedJson') {
      payload = {
        'derivedJsonTheme': themeJson,
        'defaultSceneDuration': evt.target.defaultSceneDuration.value
      }
    } else if (themeType === 'parentJson') {

      payload = {
        'parentJsonTheme': themeJson,
        'defaultSceneDuration': evt.target.defaultSceneDuration.value
      }
    } else if (themeType === 'basic') {

      payload = {
        'basicTextTheme': evt.target.basicTextTheme.value,
        'defaultSceneDuration': evt.target.defaultSceneDuration.value
      }
    }



    submitUpdateSessionDefaults(payload);
  }

  if (themeType === 'derivedJson') {

    themeDisplayBody = (
      <>
        <AceEditor
          mode="json"
          theme="monokai"
          name="derivedJsonTheme"
          value={themeJson}
          onChange={handleJsonThemeChange} 
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
          editorProps={{ $blockScrolling: true }}
          width="100%"
          height="200px"
          className="rounded"
        />

      </>
    )

  } else if (themeType === 'parentJson') {

    themeDisplayBody = (
      <>
        <AceEditor
          mode="json"
          theme="monokai"
          name="parentJsonTheme"
          value={themeJson}
          onChange={handleJsonThemeChange} // Updated to handle JSON changes
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
          editorProps={{ $blockScrolling: true }}
          width="100%"
          height="200px"
          className="rounded"
        />

      </>
    )

  } else {
    themeDisplayBody = (
      <>
        <TextareaAutosize
          placeholder="Project theme"
          name="basicTextTheme"
          minRows={3}
          className={`w-full mt-2 ${bgColor} ${text2Color} p-2`}
          defaultValue={basicTextTheme}
        />
        <div className={`text-xs ${text2Color} mb-2 ml-2`}>
          Theme keywords
        </div>
      </>
    )
  }
  return (
    <div>
      <form onSubmit={submitUpdateSessionDefaultsWithType}>
        {themeDisplayBody}
        <input
          type="text"
          placeholder="Scene duration"
          name="defaultSceneDuration"
          className={`w-full mt-2 ${bgColor} ${text2Color} p-1 h-[30px]`}
          defaultValue={defaultSceneDuration}
        />
        <div className={`text-xs ${text2Color} mb-2 ml-2`}>
          Default scene duration
        </div>
        <div className="ml-2">
          <SecondaryButton type="submit">Save</SecondaryButton>
        </div>
      </form>
    </div>
  )

}