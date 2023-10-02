interface ILocalStorage<TWordSearchCreatorState,TWordSearch,TWordSearchOverview>{
    setWordSearchCreatorState(state:TWordSearchCreatorState):void;
    getWordSearchCreatorState():TWordSearchCreatorState | undefined;
    //------------------------------------------------------
    getWordSearchOverviews(): TWordSearchOverview[];

    getWordSearch(id:number):TWordSearch | undefined;
    newWordSearch(wordSearch:TWordSearch):number;
    updateWordSearch(wordSearch:TWordSearch,id:number):void;
    deleteWordSearch(id:number):void;
}

let wordSearchId = 0;
const wordSearchOverviewsKey = "wordSearchOverviews";
const wordSearchCreatorKey = "wordSearchCreator"
type Mapper<TWordSearch,TWordSearchOverview> =  (wordSearch:TWordSearch,wordSearchId:number) => TWordSearchOverview
class LocalStorage<TWordSearchCreatorState,TWordSearch, TWordSearchOverview> implements ILocalStorage<TWordSearchCreatorState,TWordSearch,TWordSearchOverview> {
    constructor(private mapper:Mapper<TWordSearch,TWordSearchOverview>){

    }
    private get<T>(key:string):T|undefined{
        const item = localStorage.getItem(key);
        if(item !== null){
            return JSON.parse(item) as T;
        }
    }
    
    private set(key:string, value:unknown){
        localStorage.setItem(key, JSON.stringify(value));
    }

    getWordSearchCreatorState(): TWordSearchCreatorState | undefined {
        return this.get<TWordSearchCreatorState>(wordSearchCreatorKey);
    }

    setWordSearchCreatorState(state: TWordSearchCreatorState) {
        this.set(wordSearchCreatorKey, state);
    }

    deleteWordSearch(id:number) {
        window.localStorage.removeItem(id.toString());

        const wordSearchOverviews = this.getWordSearchOverviews();
        //todo
        //const newOverviews = wordSearchOverviews.filter(x => x.id !== id);
        //this.setWordSearchOverviews(newOverviews);
    }

    getWordSearch<TWordSearch>(id:number) {
        return this.get<TWordSearch>(id.toString());
    }
    
    newWordSearch(wordSearch: TWordSearch): number {
        const newWordSearchId = wordSearchId++;
        this.setWordSearch(wordSearch, newWordSearchId);

        const wordSearchOverviews = this.getWordSearchOverviews();
        const newOverviews = [...wordSearchOverviews, this.mapper(wordSearch, newWordSearchId)];
        this.setWordSearchOverviews(newOverviews);
        
        return newWordSearchId;
    }
    
    updateWordSearch(wordSearch: TWordSearch, id: number) {
        this.setWordSearch(wordSearch, id);
        const wordSearchOverviews = this.getWordSearchOverviews();
        const updatedOverview = this.mapper(wordSearch, id)
        //const newOverviews = wordSearchOverviews.map(wordSearchOverview => wordSearchOverview.id === id ? updatedOverview : wordSearchOverview);
        //this.setWordSearchOverviews(newOverviews);
    }

    private setWordSearch<TWordSearch>(wordSearch:TWordSearch, id:number){
        this.set(id.toString(), wordSearch);
    }

    private setWordSearchOverviews(overviews:TWordSearchOverview[]){
        this.set(wordSearchOverviewsKey, overviews)
    }   

    getWordSearchOverviews() {
        return this.get<TWordSearchOverview[]>(wordSearchOverviewsKey) ?? [];
    }

}

export function createLocalStorage<TWordSearchCreatorState,TWordSearch,TWordSearchOverview>(
    mapper:Mapper<TWordSearch,TWordSearchOverview>
){
    return new LocalStorage<TWordSearchCreatorState,TWordSearch,TWordSearchOverview>(mapper);
}