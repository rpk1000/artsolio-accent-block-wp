import './style.css';
import './editor.css';

import { registerBlockType } from '@wordpress/blocks';
import metadata from '../accent/block.json';
import edit from './edit';
import save from './save';

// No variation imports
registerBlockType( metadata.name, { edit, save } );