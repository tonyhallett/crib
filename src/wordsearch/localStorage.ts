let wordSearchId = -1;
const wordSearchOverviewsKey = "wordSearchOverviews";
const wordSearchCreatorKey = "wordSearchCreator";

export class LocalStorage<
  TWordSearchCreatorState,
  TWordSearch,
  TKeys extends (keyof TWordSearch)[]
> {
  constructor(readonly props: TKeys) {}
  private get<T>(key: string): T | undefined {
    const item = localStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item) as T;
    }
  }

  private set(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  //#region WordSearchCreatorState
  getWordSearchCreatorState(): TWordSearchCreatorState | undefined {
    return this.get<TWordSearchCreatorState>(wordSearchCreatorKey);
  }

  setWordSearchCreatorState(state: TWordSearchCreatorState) {
    this.set(wordSearchCreatorKey, state);
  }
  //#endregion

  deleteWordSearch(id: number) {
    window.localStorage.removeItem(id.toString());

    const wordSearchOverviews = this.getWordSearchOverviews();
    const newOverviews = wordSearchOverviews.filter((x) => x.id !== id);
    this.setWordSearchOverviews(newOverviews);
  }

  getWordSearch(id: number): TWordSearch | undefined {
    return this.get<TWordSearch>(id.toString());
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private mapWordSearch(wordSearch: TWordSearch, id: number) {
    const mapped = this.props.reduce((acc, prop) => {
      acc[prop] = (wordSearch as any)[prop];
      return acc;
    }, {} as any);
    mapped.id = id;
    return mapped;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  private initializeWordSearchId() {
    if (wordSearchId === -1) {
      const wordSearchOverviews = this.getWordSearchOverviews();
      if (wordSearchOverviews.length === 0) {
        wordSearchId = 0;
      } else {
        wordSearchId = wordSearchOverviews[wordSearchOverviews.length - 1].id;
      }
    }
  }

  newWordSearch(wordSearch: TWordSearch): number {
    this.initializeWordSearchId();
    const newWordSearchId = ++wordSearchId;
    this.setWordSearch(wordSearch, newWordSearchId);

    const wordSearchOverviews = this.getWordSearchOverviews();
    const newOverviews = [
      ...wordSearchOverviews,
      this.mapWordSearch(wordSearch, newWordSearchId),
    ];
    this.setWordSearchOverviews(newOverviews);

    return newWordSearchId;
  }

  updateWordSearch(wordSearch: TWordSearch, id: number) {
    this.setWordSearch(wordSearch, id);

    const wordSearchOverviews = this.getWordSearchOverviews();
    const updatedOverview = this.mapWordSearch(wordSearch, id);
    const newOverviews = wordSearchOverviews.map((wordSearchOverview) =>
      wordSearchOverview.id === id ? updatedOverview : wordSearchOverview
    );
    this.setWordSearchOverviews(newOverviews);
  }

  private setWordSearch(wordSearch: TWordSearch, id: number) {
    this.set(id.toString(), wordSearch);
  }

  private setWordSearchOverviews(overviews: unknown[]) {
    this.set(wordSearchOverviewsKey, overviews);
  }

  getWordSearchOverviews(): ({ [K in TKeys[number]]: TWordSearch[K] } & {
    id: number;
  })[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.get<any>(wordSearchOverviewsKey) ?? [];
  }
}
