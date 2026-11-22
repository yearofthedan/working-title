import { fileSystemFolders, type DirectoryPicker } from '../../../../adapters/file-system-folders';
import { snowflakeExtended } from '../../../../methods/snowflake-extended';

export const aPickerTheWriterCancels: DirectoryPicker = {
  showDirectoryPicker: () => Promise.reject(new DOMException('nothing chosen', 'AbortError')),
};

export const aPickerThatFails: DirectoryPicker = {
  showDirectoryPicker: () => Promise.reject(new Error('the folder could not be opened')),
};

export const aChooserTheWriterCancels = () =>
  fileSystemFolders(snowflakeExtended, aPickerTheWriterCancels);

export const aChooserThatFails = () => fileSystemFolders(snowflakeExtended, aPickerThatFails);

export const aChooserWithNoPicker = () => fileSystemFolders(snowflakeExtended, {});
