import { jsxOpeningElement } from "@babel/types";
import { useLocation } from "solid-app-router";
import {
  Component,
  createEffect,
  createResource,
  Switch,
  Match,
} from "solid-js";
import { For, Show, createSignal } from "solid-js";

type PlaygroundApiDocsType = {

};

type SignatureType = {
  property?: any;
  title?: string;
  type?: string;
  enumArray?: Array<string>;
  defaultValue?: string;
  description?: string;
  examples?: Array<string>;
  max?: number;
  min?: number;
  items?: any;
  minItems?: number;
  maxItems?: number;
  pattern?: string;
  additionalProperties?: boolean;
  buttonClick: Function;
};

type JsonSchemaType = {
  json: string;
  mouseHoverFunc: Function;
};

type BoxType = {
  content?: any;
  activeClass?: string;
  nested?: boolean;
};

const fetchRecieveData = async (id: string) =>
  (id && await fetch(`https://api.deriv.com/config/v3/${id}/receive.json`, {
    mode: 'cors' // 'cors' by default
  })).json();

const fetchSendData = async (id: string) =>
  (id && await fetch(`https://api.deriv.com/config/v3/${id}/send.json`, {
    mode: 'cors' // 'cors' by default
  })).json();

const Box: Component<BoxType> = ({ content, activeClass, nested }) => {
  const [showSignatureBox, setShowSignatureBox] = createSignal(false);
  const [showSourceButton, setShowSourceButton] = createSignal(false);

  console.log("content", content)
  const strDescription = content?.description?.replace(/(`.`)/g, (match: string) => `<code class="bg-[rgba(255,255,255,.16)] text-[#fff] text-[14px] mr-1.5 px-2 py-1.5 font-normal rounded">${match}</code>`)?.replace(/`/g, '');

  let expand_ref: any, source_ref: any;

  const mouseHoverFunc = (show: number) => {
    expand_ref.style.opacity = show;
    source_ref.style.opacity = show;
  };

  const localProperties = content?.properties || content?.patternProperties
  return (
    <>
      <div
        class={`box relative border-none rounded pb-2.5 mb-10 ${content?.title} ${activeClass}`}
        onMouseEnter={() => mouseHoverFunc(1)}
        onMouseLeave={() => mouseHoverFunc(0)}
      >
        <div
          class={`box_header bg-[#252525] ${nested ? "px-4 py-2" : "p-6"
            } rounded-t-[6px] ${!content?.title && "px-4 py-2"}`}
        >
          <div class="box-title">
            <Show when={content?.title}>
              <div
                class={`box-name ${nested ? "text-base" : "text-2xl"
                  } mobile:text-lg mb-2 text-white leading-none font-bold`}
              >
                {content?.title}
              </div>
            </Show>
            <Show when={content?.description}>
              <div class="box-description flex flex-nowrap w-full items-center justify-center leading-[17px] text-[#c2c2c2]">
                <div class="box-text flex justify-start	 items-center w-full">
                  <p
                    class="m-t-[3px] text-sm leading-[2] text-[#c2c2c2]"
                    innerHTML={strDescription}
                  ></p>
                </div>
                <Show when={content?.auth_required}>
                  <div class="scopes flex items-center	justify-end text-[14px] text-[#c2c2c2] w-full">
                    Auth Required:
                    <For each={content?.auth_scopes}>
                      {(scope: Array<string>) => (
                        <span class="type-enum leading-[1.43] bg-[rgba(133,172,176,.16)] text-[#85acb0] text-[14px] border-none px-2 py-1.5 ml-2 px-2 py-1/5 whitespace-nowrap rounded">
                          {scope}
                        </span>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </Show>
          </div>
        </div>
        <div
          class="source-button button absolute p-0.5 mt-0.75 right-0.5	w-[18px] text-center cursor-pointer	font-bold text-[10px] text-[#a9a9a9] opacity-0"
          ref={source_ref}
          onClick={() => setShowSourceButton(!showSourceButton())}
          title="Source"
        >
          \u007B &#x7D
        </div>
        <Show when={!showSourceButton()}>
          <div class={`box-body px-6 py-7 ${!content?.properties && "py-4"}`}>
            <div
              class="expand-button absolute mt-[15px] p-0.5 right-0.5 float-rigth w-[18px] text-center text-[#a9a9a9] font-bold text-[15px] cursor-pointer opacity-0"
              title="Expand all"
              ref={expand_ref}
            >
              +
            </div>
            <Show when={localProperties}>
              <For each={Object.keys(localProperties)}>
                {(property) => (
                  <>
                    <Signature
                      property={localProperties[property]}
                      title={property}
                      type={
                        localProperties[property]?.items
                          ? localProperties[property]?.items.type
                          : localProperties[property]?.type
                      }
                      max={localProperties[property]?.maximum}
                      min={localProperties[property]?.minimum}
                      enumArray={
                        localProperties[property]?.enum ||
                        localProperties[property]?.items?.enum
                      }
                      defaultValue={localProperties[property]?.default}
                      examples={localProperties[property]?.examples}
                      description={localProperties[property]?.description}
                      items={localProperties[property]?.items}
                      minItems={localProperties[property]?.minItems}
                      maxItems={localProperties[property]?.maxItems}
                      pattern={localProperties[property]?.pattern}
                      additionalProperties={
                        localProperties[property]?.additionalProperties
                      }
                      buttonClick={() =>
                        setShowSignatureBox(!showSignatureBox())
                      }
                    />
                  </>
                )}
              </For>
            </Show>
            <Show when={!localProperties && content?.enum}>
              <Signature
                type={content?.type}
                enumArray={content?.enum}
                items={content?.items}
                pattern={content?.pattern}
                defaultValue={content?.default}
                additionalProperties={content?.additionalProperties}
                buttonClick={() => setShowSignatureBox(!showSignatureBox())}
              />
            </Show>
          </div>
        </Show>
        <Show when={showSourceButton()}>
          <JsonSchema json={content} mouseHoverFunc={mouseHoverFunc} />
        </Show>
      </div>
      <div class="end"></div>
    </>
  );
};
const Signature: Component<SignatureType> = ({
  property,
  title,
  type,
  max,
  min,
  defaultValue,
  examples,
  description,
  enumArray,
  items,
  minItems,
  maxItems,
  pattern,
  additionalProperties,
  buttonClick,
}) => {
  const [showSignature, setShowSignature] = createSignal(false);
  const [activeClass, setActiveClass] = createSignal('');
  const strDescription = description?.replace(/(`.`)/g, match => `<code class="bg-[rgba(255,255,255,.16)] text-[#fff] text-[14px] mr-1.5 px-2 py-1.5 font-normal rounded">${match}</code>`)?.replace(/`/g, '');
  const signatureExpand = () => {
    buttonClick();
    setShowSignature(!showSignature());
  };


  const getType = () => {
    if (items?.additionalProperties !== undefined && property?.items?.title) {
      return property?.items?.title
    } else if (additionalProperties !== undefined && property.title) {
      return property?.title
    } else {
      if (Array.isArray(type)) {
        return type?.join(", ")
      } else {
        return type
      }
    }
  };

  const signatureType = getType();

  return (
    <div class="signature flex flex-col mb-6">
      <div class="signature-header  flex flex-row h-[fit-content] mobile:flex-wrap mobile:justify-between	mobile:align-center">
        <Show when={title}>
          <div class="property-name flex w-[40%] text-white text-1 mt-2 mr-2 font-bold mobile:w-auto mobile:justify-start mobile:my-2">
            {title}
          </div>
        </Show>
        <div class="signature-type flex w-3/5 flex-wrap	items-center pl-1/5 mobile:w-auto">
          <Show when={enumArray || items}>
            <span class="type-keyword text-[#c2c2c2] text-sm mt-2 mr-2">
              {items ? "array" : enumArray?.length === 1 ? "constant" : "enum"}
            </span>
            <Show when={minItems || maxItems}>
              <span class="type-keyword text-[#c2c2c2] text-[14px] mt-2 mr-2">
                [{minItems}..{maxItems}]
              </span>
            </Show>
            <Show when={items?.enum}>
              <span class="type-keyword text-[#c2c2c2] text-sm mt-2 mr-2">
                {items.enum?.length === 1 ? "constant" : "enum"}
              </span>
            </Show>
          </Show>
          <Show when={type}>
            <Switch>
              <Match when={type === "string"}>
                <span
                  class={
                    items && items.type != "string"
                      ? `signature-type-string mt-2 mr-2 text-[14px] bg-[#0e0e0e] text-[#9ed178] px-4 py-1.5 rounded cursor-pointer '} ${!showSignature() && "bg-[#323738] text-[#9ed178]"
                      }`
                      : "signature-type-string mt-2 mr-2 text-[14px] text-[#9ed178]"
                  }
                  onClick={signatureExpand}
                >
                  {signatureType}
                </span>
              </Match>
              <Match when={type === "object"}>
                <span
                  class={`signature-type-object mt-2 mr-2 text-[14px] bg-[#0e0e0e] text-[#9ed178] px-4 py-1.5 rounded  cursor-pointer ${!showSignature() && "bg-[#323738] text-[#ffffff]"
                    }`}
                  onClick={signatureExpand}
                >
                  {signatureType}
                </span>
              </Match>
              <Match when={type === "array"}>
                <span
                  class="signature-type-array mt-2 mr-2 text-[14px] text-[#C2C2C2]"
                  onClick={signatureExpand}
                >
                  {signatureType}
                </span>
              </Match>
              <Match when={type === "integer"}>
                <span
                  class="signature-type-integer mt-2 mr-2 text-[14px] text-[#85acb0]"
                  onClick={signatureExpand}
                >
                  {signatureType}
                </span>
              </Match>
              <Match when={type === "number"}>
                <span
                  class="signature-type-number mt-2 mr-2 text-[14px] text-[#8181cc]"
                  onClick={signatureExpand}
                >
                  {signatureType}
                </span>
              </Match>
              <Match when={Array.isArray(type)}>
                <span
                  class={`signature-type-${type} mt-2 mr-2 text-[14px] text-[#fff]`}
                  onClick={signatureExpand}
                >
                  {signatureType}
                </span>
              </Match>
            </Switch>
          </Show>
          <Show when={pattern}>
            <span class="type-pattern text-[#556b2f] text-[80%] mt-2 mr-2">
              {pattern}
            </span>
          </Show>
          <For each={enumArray}>
            {(item) => (
              <span class="type-enum leading-[1.43] bg-[rgba(133,172,176,.16)] text-[#85acb0] text-[14px] border-none px-2 py-1.5 mt-2 mr-2 whitespace-nowrap	rounded">
                {item}
              </span>
            )}
          </For>
          <Show when={min !== undefined || max !== undefined}>
            <span class="type-keyword text-[#c2c2c2] text-[14px] mt-2 mr-2">
              [{min};{max ? max : '∞'}]
            </span>
          </Show>
          <Show when={defaultValue}>
            <span class="type-keyword default text-[#c2c2c2] text-[14px] mt-2 mr-2">
              default:
            </span>
            <code class="type-default text-[#2f4f4f] text-[16px] border border-solid rounded border-[#eaeced] py-0.5 px-1 font-bold">
              {defaultValue}
            </code>
          </Show>
          <Show when={examples}>
            <span class="type-keyword default text-[#c2c2c2] text-[14px] mt-2 mr-2">
              Example:
            </span>
            <code class="type-default text-[#ffffff] text-[16px] border border-solid rounded border-[#eaeced] py-0.5 px-1 font-bold">
              {examples}
            </code>
          </Show>
        </div>
      </div>
      <Show when={description}>
        <div class="signature-description  text-[#c2c2c2] float-left max-w-[600px] w-full leading-[17px]">
          <p
            class="m-0 mt-2 leading-[2] text-[14px]"
            innerHTML={strDescription}
          ></p>
        </div>
      </Show>
      <Show when={items && showSignature()}>
        <div class="signature-box-container mt-2 clear-both">
          <div class="sub-box-container bg-[rgba(37,37,37,.4)">
            <Box content={items} activeClass={activeClass()} />
          </div>
        </div>
      </Show>
      <Show when={!items && type === "object" && showSignature()}>
        <div class="signature-box-container mt-2 clear-both">
          <div class="sub-box-container bg-[rgba(37,37,37,.4)">
            <Box content={property} nested={true} />
          </div>
        </div>
      </Show>
    </div>
  );
};

const JsonSchema: Component<JsonSchemaType> = ({ json, mouseHoverFunc }) => {
  return (
    <div
      class="source block px-6 py-7 bg-[#0e0e0e] mb-4"
      onMouseEnter={() => mouseHoverFunc(1)}
      onMouseLeave={() => mouseHoverFunc(0)}
    >
      <pre class="json-schema text-[#ffcd44] text-[14px] leading-[20px] max-w-full overflow-auto whitespace-pre-wrap">
        {JSON.stringify(json, null, 2)}
      </pre>
    </div>
  );
};

export const PlaygroundApiDocs: Component<PlaygroundApiDocsType> = () => {
  const location = useLocation();
  const [hashLocation, setHashLocation] = createSignal(location.hash)

  const [receive] = createResource(hashLocation, fetchRecieveData);
  const [send] = createResource(hashLocation, fetchSendData);
  createEffect(() => {
    setHashLocation(location.hash)
  })

  return (
    <div data-testid="playground-api-docs">
      <span>{send()?.loading && "Loading..."}</span>

      <Switch>
        <Match when={!send.loading}>
          <div id="playground-req-schema" class="text-base">
            <Box content={send()} />
          </div>
        </Match>
      </Switch>

      <Switch>
        <Match when={!receive.loading}>
          <div id="playground-res-schema" class="text-base">
            <Box content={receive()} />
          </div>
        </Match>
      </Switch>
    </div>
  );
};
