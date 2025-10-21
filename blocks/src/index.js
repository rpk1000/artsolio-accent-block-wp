import './style.css';
import './editor.css';
import './variation'; // remains optional via PHP flag ordering; safe to keep
import edit from './edit';
import save from './save';
import { registerBlockType } from '@wordpress/blocks';

registerBlockType( 'artsolio/accent', { edit, save } );