const el = wp.element.createElement;
const registerBlockType = wp.blocks.registerBlockType;
const RichText = wp.editor.RichText;

class Edit extends React.Component {
    constructor( ...args ) {
        super( ...args );

        this.node = React.createRef();
        this.saveNode = document.createElement( 'div' );
    }

    componentDidMount() {
        this.app = Elm.Main.init( {
            node: this.node.current,
            flags: {
                attributes: this.props.attributes.elmProps,
                className: this.props.className,
                isSelected: this.isSelected,
                name: this.props.name
            }
        } );

        this.app.ports.setAttributes.subscribe(
            elmProps => {
                this.props.setAttributes( { elmProps } );
                this.saveApp.ports.externalUpdate.send( {
                    attributes: elmProps
                } );
            }
        );

        this.saveApp = Elm.Main.init( {
            node: this.saveNode,
            flags: {
                attributes: this.props.attributes.elmProps,
                className: this.props.className,
                isSelected: false,
                name: this.props.name 
            }
        } );

        this.observer = new MutationObserver( () => {
            this.props.setAttributes( { content: this.saveNode.innerHTML } );
        } );

        this.observer.observe(
            this.node.current,
            { attributes: true, childList: true, subtree: true }
        );

        this.app.ports.externalUpdate.send( { isSelected: ! this.props.isSelected } );
        this.app.ports.externalUpdate.send( { isSelected: this.props.isSelected } );
    }

    componentDidUpdate( prev ) {
        const next = this.props;

        const newProps = next.attributes.elmProps !== prev.attributes.elmProps;
        const newClassName = next.className !== prev.className;
        const newIsSelected = next.isSelected !== prev.isSelected;
        const newName = next.name !== prev.name;

        if ( newProps || newClassName || newIsSelected || newName ) {
            this.app.ports.externalUpdate.send( Object.assign(
                {},
                newProps && { attributes: this.props.attributes.elmProps },
                newClassName && { className: this.props.className },
                newIsSelected && { isSelected: this.props.isSelected },
                newName && { name: this.props.name }
            ) );

            this.saveApp.ports.externalUpdate.send( Object.assign(
                {},
                newProps && { attributes: this.props.attributes.elmProps },
                newClassName && { className: this.props.className },
                newIsSelected && { isSelected: false },
                newName && { name: this.props.name }
            ) );
        }
    }

    componentWillUnmount() {
        this.observer.disconnect();
        delete this.app;
        delete this.node;
        delete this.saveApp;
        delete this.saveNode;
    }

    render() {
        return el( 'div', { ref: this.node },
            el( RichText, { value: this.props.attributes.content } )
        );
    }
}

registerBlockType( 'dmsnell/basic-elm-block', {
    title: 'Basic Elm Block',
    icon: 'layout',
    category: 'layout',
    attributes: {
        content: {
            type: 'string',
            source: 'html',
            selector: 'div',
            default: ''
        },
        elmProps: {
            type: 'object'
        }
    },
    supports: {
        html: false
    },
    edit: Edit,
    save: props => el( 'div', { className: props.className }, el( RichText.Content, { value: props.attributes.content } ) )
} );