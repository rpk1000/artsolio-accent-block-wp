import './style.css';   // ensures build/style-index.css is emitted
import './editor.css';  // ensures build/index.css is emitted

import { registerBlockType } from '@wordpress/blocks';
import metadata from '../accent/block.json';
import edit from './edit';
import save from './save';

registerBlockType( metadata.name, { edit, save } );