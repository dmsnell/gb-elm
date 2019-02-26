port module Main exposing (Flags)

import Browser
import Html as H
import Html.Attributes as A
import Html.Events as HE
import Json.Decode as JD
import Json.Encode as JE


port setAttributes : JE.Value -> Cmd msg


port externalUpdate : (JD.Value -> msg) -> Sub msg


type alias Flags =
    JD.Value


type alias Attributes =
    { count : Int
    }


type alias BlockAPI =
    { attributes : Attributes
    , className : String
    , isSelected : Bool
    , name : String
    }


emptyBlock : BlockAPI
emptyBlock =
    { attributes =
        { count = 0 }
    , className = ""
    , isSelected = False
    , name = ""
    }


type Msg
    = BlockExternalUpdate JD.Value
    | Increment


type alias Model =
    { block : BlockAPI
    }


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


flagsDecoder : BlockAPI -> JD.Decoder BlockAPI
flagsDecoder prev =
    JD.map4
        (\count className isSelected name ->
            { attributes =
                { count = count }
            , className = className
            , isSelected = isSelected
            , name = name
            }
        )
        (JD.at [ "attributes", "count" ] JD.int
            |> JD.maybe
            |> JD.map (Maybe.withDefault prev.attributes.count)
        )
        (JD.field "className" JD.string
            |> JD.maybe
            |> JD.map (Maybe.withDefault prev.className)
        )
        (JD.field "isSelected" JD.bool
            |> JD.maybe
            |> JD.map (Maybe.withDefault prev.isSelected)
        )
        (JD.field "name" JD.string
            |> JD.maybe
            |> JD.map (Maybe.withDefault prev.name)
        )


parseFlags : JD.Value -> BlockAPI -> BlockAPI
parseFlags flags prev =
    JD.decodeValue (flagsDecoder prev) flags
        |> Result.withDefault prev


init : Flags -> ( Model, Cmd msg )
init flags =
    let
        block =
            parseFlags flags emptyBlock
    in
    ( { block = block }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd msg )
update msg model =
    case msg of
        BlockExternalUpdate flags ->
            let
                block =
                    parseFlags flags model.block
            in
            ( { model | block = block }, Cmd.none )

        Increment ->
            let
                oldAttributes =
                    model.block.attributes

                attributes =
                    { oldAttributes | count = model.block.attributes.count + 1 }

                oldBlock =
                    model.block

                block =
                    { oldBlock | attributes = attributes }
            in
            ( { model | block = block }
            , setAttributes <| JE.object [ ( "count", JE.int block.attributes.count ) ]
            )


view : Model -> H.Html Msg
view model =
    if model.block.isSelected then
        H.div [ A.class model.block.className ]
            [ H.h2 [] [ H.text <| "Block Type: " ++ model.block.name ]
            , H.text <| String.fromInt model.block.attributes.count
            , H.button [ HE.onClick Increment ] [ H.text "Increment" ]
            ]

    else
        H.div [ A.class model.block.className ]
            [ H.text <| "Count: " ++ String.fromInt model.block.attributes.count
            ]


subscriptions : Model -> Sub Msg
subscriptions model =
    externalUpdate BlockExternalUpdate
