const el = wp.element.createElement;
const registerBlockType = wp.blocks.registerBlockType;

class Edit extends React.Component {
    constructor( ...args ) {
        super( ...args );

        this.node = React.createRef();
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
            elmProps => this.props.setAttributes( { elmProps } )
        );
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
        }
    }

    componentWillUnmount() {
        delete this.app;
        delete this.node;
    }

    render() {
        return el( 'div', { ref: this.node } );
    }
}

registerBlockType( 'dmsnell/basic-elm-block', {
    title: 'Basic Elm Block',
    icon: 'layout',
    category: 'layout',
    attributes: {
        elmProps: {
            type: 'object'
        }
    },
    edit: Edit,
    save: Edit
} );