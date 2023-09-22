export interface ColorResult {
    color:string,
    done:boolean
}
export interface ColorProvider {
    initialize(textBlack:boolean, tripleA:boolean):void;
    getColor():ColorResult
}

interface ColorDetail{
    color:string,
    providerIndex:number,
    colorIndex:number
}
const exhaustedProviders = -1;
// todo type the color as css properties color
export class ContrastedBackgroundColorProvider {
    private colorDetailsMap = new Map<number, ColorDetail>();
    private currentColorProviderIndex = 0;
    private currentColorCount = 0;
    private usedColorDetails:ColorDetail[] = [];
    constructor(
        readonly colorProviders:ColorProvider[],
        readonly fallbackColor:string = "white",
        readonly textBlack:boolean = true,
        readonly tripleA:boolean = true,
    ){}

    getColor(id:number): string{
        return this.getStoredColor(id) || this.getUsedColorOrGenerateNew(id);
    }

    private getUsedColorOrGenerateNew(id:number):string {
        let colorDetail:ColorDetail;
        if(this.usedColorDetails.length > 0){
            colorDetail = this.usedColorDetails.shift() as ColorDetail;
        }else{
            colorDetail = this.generateNewColor();
        }
        this.colorDetailsMap.set(id,colorDetail);
        return colorDetail.color;
    }

    private getIfExhausted():ColorDetail | undefined {
        if(this.currentColorProviderIndex === exhaustedProviders){
            return {
                color:this.fallbackColor,
                providerIndex:exhaustedProviders,
                colorIndex:0
            }
        }
    }

    private generateNewColor(): ColorDetail {
        return this.getIfExhausted() || this.generateColorFromColorProvider();
    }

    private getColorProvider():ColorProvider {
        const colorProvider = this.colorProviders[this.currentColorProviderIndex];
        if(this.currentColorCount === 0){
            colorProvider.initialize(this.textBlack, this.tripleA);
        }
        return colorProvider;
    }

    private getColorFromProvider() : ColorResult {
        return this.getColorProvider().getColor();
    }

    private generateColorFromColorProvider():ColorDetail {
        const colorResult = this.getColorFromProvider();
        const colorDetails:ColorDetail = {
            color:colorResult.color,
            providerIndex:this.currentColorProviderIndex,
            colorIndex:this.currentColorCount
        }
        this.currentColorCount++;
        if(colorResult.done){
            this.setNextColorProvider();
        }
        return colorDetails;
    }

    private setNextColorProvider():void {
        this.currentColorProviderIndex++;
        this.currentColorCount = 0;
        if(this.currentColorProviderIndex >= this.colorProviders.length){
            this.currentColorProviderIndex = exhaustedProviders;
        }
    }

    private getStoredColor(id:number):string | undefined {
        const colorDetails =  this.colorDetailsMap.get(id);
        return colorDetails?.color;
    }

    private addToUsedColorDetails(colorDetail:ColorDetail):void {
        this.usedColorDetails.push(colorDetail);
        this.usedColorDetails = this.usedColorDetails.sort((a,b) => {
            if(a.providerIndex === b.providerIndex){
                return a.colorIndex - b.colorIndex;
            }
            return a.providerIndex - b.providerIndex;
        })
    }

    remove(id:number):void {
        const colorDetail = this.colorDetailsMap.get(id) as ColorDetail;
        if(colorDetail.providerIndex !== exhaustedProviders){
            this.addToUsedColorDetails(colorDetail);
        }
        this.colorDetailsMap.delete(id);
    }
    
}
