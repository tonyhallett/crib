import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Extension, AnyExtension, NodeConfig, getExtensionField } from '@tiptap/core';
import { Node } from '@tiptap/core';

export function nodeIsLeaf(node:Node){
    return node.config.content === undefined
}

type NodeConfigRenderTextContext = ThisParameterType<NonNullable<NodeConfig['renderText']>>
export type NodeConfigContext = Omit<NodeConfigRenderTextContext,'parent'>

export function addRenderTextLeafTextExtension(extensions:AnyExtension[]){
    return [...extensions, getRenderTextLeafTextExtension()];
}

// because of this context cannot access own options !
export function getRenderTextLeafTextExtension(nodeTypes: string[] = []) {
    const nodeTypeMatch = (node: Node) => {
        return nodeTypes.find((nodeType) => nodeType === node.name);
    };
    const matchAll = () => true;
    const matcher = nodeTypes.length > 0 ? nodeTypeMatch : matchAll;
    const mapRenderTextLeafText = (nodeConfigContext: NodeConfigContext, node: Node) => {
        return extendWithLeafText(nodeConfigContext, node) ??
            extendWithToText(nodeConfigContext, node) ?? {};

    };
    const extendWithToText = (nodeConfigContext: NodeConfigContext, node: Node) => {
        const extendNodeSchema = getExtensionField<NodeConfig['extendNodeSchema']>(
            node,
            "extendNodeSchema",
            nodeConfigContext
        );
        if (extendNodeSchema) {
            const extended = extendNodeSchema(node);
            if (extended.leafText) {
                const toText: NodeConfig['renderText'] = ({ node }) => {
                    return extended.leafText(node);
                };
                return {
                    toText
                };
            }
        }
    };
    const extendWithLeafText = (nodeConfigContext: NodeConfigContext, node: Node) => {
        const renderText = getExtensionField<NodeConfig['renderText']>(
            node,
            'renderText',
            nodeConfigContext
        );
        if (renderText && nodeIsLeaf(node)) {
            return {
                leafText(node: ProseMirrorNode) {
                    return renderText({
                        node,
                        
                        // do not have access to this information !
                        pos: 0,
                        index: 0,
                        parent: undefined as unknown as ProseMirrorNode,
                    });
                }
            };
        }
    };
    return Extension.create({
        name: "renderTextLeafText",
        extendNodeSchema(node) {
            if (matcher(node)) {
                return mapRenderTextLeafText(this, node);
            }
            return {};

        },
    });
}
