import * as fs from 'fs-extra';
import * as path from 'path';

import { EditorValues, MAIN_JS } from '../../src/interfaces';
import { createEditorValues } from '../mocks/editor-values';
import {
  ensureRequiredFiles,
  getEmptyContent,
  isSupportedFile,
} from '../../src/utils/editor-utils';
import { readFiddle } from '../../src/utils/read-fiddle';

describe('read-fiddle', () => {
  const folder = '/some/place';

  beforeEach(() => {
    (fs.existsSync as jest.Mock).mockImplementationOnce(() => true);
    (fs.readFileSync as jest.Mock).mockImplementation((filename) => filename);
    console.warn = jest.fn();
  });

  afterEach(() => {
    (console.warn as jest.Mock).mockClear();
  });

  function setupFSMocks(editorValues: EditorValues) {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue(Object.keys(editorValues));
    (fs.readFileSync as jest.Mock).mockImplementation((filename) => {
      return editorValues[path.basename(filename)];
    });
  }

  it('injects main.js if not present', async () => {
    const mockValues = {}; // no files
    setupFSMocks(mockValues);

    const fiddle = await readFiddle(folder);

    expect(console.warn).not.toHaveBeenCalled();
    expect(fiddle).toStrictEqual({ [MAIN_JS]: getEmptyContent(MAIN_JS) });
  });

  it('reads supported files', async () => {
    const content = 'hello';
    const mockValues = { [MAIN_JS]: content };
    setupFSMocks(mockValues);

    const fiddle = await readFiddle(folder);

    expect(fiddle).toStrictEqual(mockValues);
  });

  it('skips unsupported files', async () => {
    const content = 'hello';
    const mockValues = {
      [MAIN_JS]: content,
      'file.js': content,
      'file.php': content,
    };
    setupFSMocks(mockValues);
    const expected = Object.fromEntries(
      Object.entries(mockValues).filter(([id, _]) => isSupportedFile(id)),
    );

    const fiddle = await readFiddle(folder);

    expect(fiddle).toStrictEqual(expected);
  });

  function expectedOnReadError(values: EditorValues): EditorValues {
    // empty strings since the files could not be read,
    // and some truthy content in required files
    return ensureRequiredFiles(
      Object.fromEntries(Object.keys(values).map((id) => [id, ''])),
    );
  }

  it('handles read errors gracefully', async () => {
    const mockValues = createEditorValues();
    setupFSMocks(mockValues);
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('bwap');
    });

    const files = await readFiddle(folder);
    expect(files).toStrictEqual(expectedOnReadError(mockValues));
  });

  it('ensures truthy even when read returns null', async () => {
    const mockValues = createEditorValues();
    setupFSMocks(mockValues);
    (fs.readFileSync as jest.Mock).mockReturnValue(null);

    const files = await readFiddle(folder);
    expect(files).toStrictEqual(expectedOnReadError(mockValues));
  });
});
