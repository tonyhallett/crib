import { Color } from '@tiptap/extension-color'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
//import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { Node as ProseMirrorNode, NodeType, Attrs, Schema } from '@tiptap/pm/model'
import { EditorContent, useEditor } from '@tiptap/react'
import { Editor } from '@tiptap/core'
import { ReplaceStep } from '@tiptap/pm/transform'
import { NodeSpec } from '@tiptap/pm/model'
import { Node } from '@tiptap/core'
import { addRenderTextLeafTextExtension } from './renderTextLeafTextExtension'
// Node => NodeType
function logIs(nodeType:NodeType){
    console.log(`isText - ${nodeType.isText}`);
    console.log(`isInline - ${nodeType.isInline}`);
    console.log(`isBlock - ${nodeType.isBlock}`);
    console.log(`isTextblock - ${nodeType.isTextblock}`);
    
    
    console.log(`isLeaf - ${nodeType.isLeaf}`);
    console.log(`inlineContent - ${nodeType.inlineContent}`);
    console.log(`isAtom - ${nodeType.isAtom}`);
}

function logAttrs(attrs:Attrs,logFrom:string){
    const attributeEntries = Object.entries(attrs);
    //surely has
    if(attributeEntries.length > 0 ){
        console.log(`${logFrom} attributes`);
        attributeEntries.forEach(([key, value]) => {
            console.log(`${key} : ${value}`);
        });
    }
}

function logSchemaNodeTypes(schema:Schema){
    const nodes = schema.nodes;
    Object.entries(nodes).forEach(([key, nodeType]) => {
        console.log(`${key} :`);
        const markSet = nodeType.markSet;
        if(markSet){
            if(markSet.length > 0 ){
                console.log("marks");
                markSet.forEach((mark) => {
                    console.log(mark.name);
                    const markSpec = mark.spec;
                });
            }
        }else{
            console.log("no markset");
        }

        logIs(nodeType);

        const nodeSpec = nodeType.spec;
        
    });
}
function logNodeSpec(nodeSpec:NodeSpec){
    console.log(`inline - ${nodeSpec.inline}`);
        console.log(`group - ${nodeSpec.group}`);
        console.log(`marks - ${nodeSpec.marks}`);
        if(nodeSpec.content){
            console.log(`content - ${nodeSpec.content}`);
        }
}
function logSchema(schema:Schema){
    const schemaObject = schema.spec.nodes.toObject();
    Object.entries(schemaObject).forEach(([nodeName, nodeSpec]) => {
        console.log(nodeName);
        //const nodeType = editor.schema.nodes[nodeName];
        logNodeSpec(nodeSpec);
    });
    
}
function logTopNode(editor:Editor){
    console.log(JSON.stringify(editor.getJSON(),null,2));
}
function logNodes(editor:Editor){
        const topNode = editor.state.doc;
        // want a nested logger
        const lookAtNode = (node:ProseMirrorNode) => {
            console.log(`node type ${node.type.name}`);
            logAttrs(node.attrs,"node");
            logIs(node.type);
            
            if(node.type.name === "text"){
                console.log(`node text - ${node.text}`);
            }
            if(node.marks.length > 0){
                node.marks.forEach((mark) => {
                    console.log(`mark - ${mark.type.name}`);
                    const markType = mark.type;
                    const markSpec = markType.spec;
                    logAttrs(mark.attrs,"mark");
                });
            }
            console.log("");
            node.forEach((childNode) => {
                lookAtNode(childNode);
            });
            
        }
        lookAtNode(topNode);

        console.log("");
        
        //topNode.attrs
        
        //topNode.child
        //topNode.childAfter
        //topNode.childBefore
        //topNode.childCount
        //topNode.firstChild
        //topNode.lastChild
        
        //topNode.forEach
        //topNode.descendants

        //topNode.nodeAt

        topNode.content // Fragment
        
        // inlineContent / is.... taken from the nodeTyoe
}




// can I create my own Text node which is a leaf node
const Text = Node.create({
    name: 'text',
    group: 'inline',
    renderText({ node}) {
        return node.text as string;
    }
    /* extendNodeSchema(node) {
        if(this.name === "text"){
            return {
                leafText(node:ProseMirrorNode){
                    return node.text;
                }
            }
        }
        return {};
    } */

  })
  
export function TestWord(){
    const tipTapEditor = useEditor({
      extensions: addRenderTextLeafTextExtension([Document, Paragraph, Text, TextStyle, Color]),
      content: `
      <p><span style="color: #958DF1">Oh, for some reason that’s purple.</span><span style="color: #FFAC1C">Oh, for some reason that’s purple.</span></p>
        `,
      onCreate:({editor}) => {
        //logSchema(editor.schema);
        //logTopNode(editor);
        const checkit = editor.state.doc.firstChild?.firstChild as ProseMirrorNode;
        const spec = checkit?.type.spec;
        //alert(spec?.toText({node:checkit}));
        alert(spec?.leafText?.(checkit));
      },
      
      onUpdate({editor, transaction}) {
        console.log("onUpdate");
        transaction.steps.forEach((step) => {  
            console.log("step toJSON");
            // this does not provide any slice information when text is selected and paste over it
            console.log(step.toJSON());

            if(step instanceof ReplaceStep){
                console.log("replace step slice");
                console.log(JSON.stringify(step.slice));
            }
        });
        const before = transaction.before // document
        transaction.doc // difference to before ?
        transaction.docChanged // isn't this a guarantee with tiptap

        // if restore before - will this mess up the selection ?
        const text = editor.getText();
        console.log(`update text - ${text}`);
        /* if(text.indexOf(' ') !== -1){
            const newTransaction = editor.state.tr;
            // how do you use before with the transaction ?

            const newState = editor.state.apply(newTransaction);
            editor.view.updateState(newState);
        }
        */


        //logNodes(editor);
      },
      editorProps:{
        /* decorations(state) {
            
        }, */
        
        handleTextInput(view, from, to, text) {
            console.log("handleTextInput");
            console.log(text);
            console.log(from);
            console.log(to);
            return false
        },
        /* handleKeyPress(view, event) {
            return event.code === 'Space' // which prevents handleTextInput from being called
        }, */
        handlePaste(view, event, slice) {
            console.log("handlePaste slice");
            const clipboardData = event.clipboardData;

            //console.log(clipboardData?.types);
            const data = clipboardData?.getData('text/plain');
            
            console.log(`data - ${data}`);// no information on what is pasted 
            /*
                Can be used to override the behavior of pasting. slice is the pasted content parsed by the editor, but you can directly access the event to get at the raw content.
            */

            return data?.indexOf(" ") !== -1;

            //console.log(JSON.stringify(slice));
            // not sure how you would use the slice
        },
        /* handleDrop(view, event, slice, moved) {
            
        }, */

        // before handlePaste - so removing space will not work if looking at the clipboard data
        transformPastedText(text, plain, view) {
            console.log("transformPastedText");
            console.log(text);
            //remove spaces from text
            return text.replace(/\s/g, '');

        }, 

        // before is parsed 
        //not sure when this is called given not raised
        // when paste <p>pasted</p> - when it did get raised it was an html tag...
        /* transformPastedHTML(html, view) {
            console.log("transformPastedHTML");
            console.log(html);
            return html;
        }, */
        
        // pasted or dragged-and-dropped
       /*  transformPasted(slice, view) {
            
        },
        */
        
        // have input rule and paste rule 
      }
    })
  
    if (!tipTapEditor) {
      return null
    }
    
    //editor.getJSON
    //editor.schema
    //editor.state.doc

    //editor.view.updateState - if wanted to manually outside of a transaction
    return <EditorContent editor={tipTapEditor} />
}