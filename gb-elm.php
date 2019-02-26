<?php
/**
 * Plugin Name: Elm Blocks
 * Plugin URI: http://wordpress.com/
 * Description: Provides a set of blocks written in Elm
 * Version: 1.0
 * Author: Dennis Snell <dennis.snell@automattic.com>
 * Author URI: dmsnell.com
 * License: GPL-2.0
 **/

add_action( 'init', function() {
    wp_register_script(
        'dmsnell-gb-elm',
        plugins_url( 'elm.js', __FILE__ ),
        []
    );

    wp_register_script(
        'dmsnell-gb-elm-loader',
        plugins_url( 'loader.js', __FILE__ ),
        [ 'dmsnell-gb-elm', 'wp-element', 'wp-blocks', 'wp-editor' ]
    );

    register_block_type( 'dmsnell/basic-elm-block', [
        'editor_script' => 'dmsnell-gb-elm-loader'
    ] );
} );