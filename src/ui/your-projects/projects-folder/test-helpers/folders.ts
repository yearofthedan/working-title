import { fileSystemFolders } from '../../../../adapters/file-system-folders';
import { snowflakeExtended } from '../../../../methods/snowflake-extended';
import { aPickerThatFails, aPickerTheWriterCancels } from '../../../../test-helpers/folders';

export const aChooserTheWriterCancels = () =>
  fileSystemFolders(snowflakeExtended, aPickerTheWriterCancels);

export const aChooserThatFails = () => fileSystemFolders(snowflakeExtended, aPickerThatFails);

export const aChooserWithNoPicker = () => fileSystemFolders(snowflakeExtended, {});
