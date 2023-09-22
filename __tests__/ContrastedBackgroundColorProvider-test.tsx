import {ContrastedBackgroundColorProvider, ColorProvider, ColorResult} from '../src/wordsearch/creator/ContrastedBackgroundColorProvider';

describe('ContrastedBackgroundColorProvider', () => {
    it('should lazily initialize providers', () => {
        const initialize = jest.fn();
        new ContrastedBackgroundColorProvider([
            {
                initialize,
                getColor:jest.fn()
            }
        ]);
        expect(initialize).not.toHaveBeenCalled();
    });
    describe('first request for color', () => {
        const initializeArgs:{
            textBlack:boolean, tripleA:boolean
        }[] = [
            {
                textBlack:true,
                tripleA:false
            },
            {
                textBlack:false,
                tripleA:false
            },
            {
                textBlack:true,
                tripleA:true
            },
            {
                textBlack:false,
                tripleA:true
            }
        ]
        initializeArgs.forEach((args) => {
            it('should initialize the first provider', () => {
                const initialize = jest.fn();
                const getColor = jest.fn().mockReturnValue('red');
                const initialize2 = jest.fn();
                const contrastedBackgroundColorProvider = new ContrastedBackgroundColorProvider([
                    {
                        initialize,
                        getColor
                    },
                    {
                        initialize:initialize2,
                        getColor:jest.fn()
                    }
                ], '', args.textBlack, args.tripleA);
                contrastedBackgroundColorProvider.getColor(1)
                expect(initialize).toHaveBeenCalledWith(args.textBlack,args.tripleA);
                });
        });
        
        it('should return from the first provider' , () => {
            const contrastedBackgroundColorProvider = new ContrastedBackgroundColorProvider([
                {
                    initialize:jest.fn(),
                    getColor(){
                        return {
                            color:'red',
                            done:false
                        }
                    }
                },
                {
                    initialize:jest.fn(),
                    getColor:jest.fn()
                }
            ]);
            const color = contrastedBackgroundColorProvider.getColor(1)
            expect(color).toBe('red');
        });
    });
    describe('request for color by same id',() => {
        it('should not ask a provider', () => {
            const thrower = jest.fn().mockImplementation(() => {throw new Error('should not be called')});
            const getColor = jest.fn().mockReturnValue({
                color:'red',
                done:false
            });
            const contrastedBackgroundColorProvider = new ContrastedBackgroundColorProvider([
                {
                    initialize:jest.fn(),
                    getColor
                },
                {
                    initialize:thrower,
                    getColor:thrower
                }
            ]);
            contrastedBackgroundColorProvider.getColor(1);
            contrastedBackgroundColorProvider.getColor(1);
            expect(getColor).toHaveBeenCalledTimes(1);

        });
        it('should return the stored color', () => {
            const contrastedBackgroundColorProvider = new ContrastedBackgroundColorProvider([
                {
                    initialize:jest.fn(),
                    getColor(){
                        return {
                            color:'red',
                            done:false
                        }
                    }
                },
            ]);
            contrastedBackgroundColorProvider.getColor(1);
            const color = contrastedBackgroundColorProvider.getColor(1);
            expect(color).toBe('red');
        })
    })
    describe('subsequent requests with new id', () => {
        describe('no removals', () => {
            describe('provider not done', () => {
                it('should ask the provider again', () => {
                    let first = true;
                    const contrastedBackgroundColorProvider = new ContrastedBackgroundColorProvider([
                        {
                            initialize:jest.fn(),
                            getColor(){
                                const result = {
                                    color:first ? 'red' : 'blue',
                                    done:false
                                };
                                first = false;
                                return result;
                            }
                        },
                    ]);
                    contrastedBackgroundColorProvider.getColor(1);
                    const color = contrastedBackgroundColorProvider.getColor(2);
                    expect(color).toBe('blue');
                })
            });
            describe('provider done', () => {
                describe('not exhausted', () => {
                    it('should initialize the next provider', () => {
                        const secondInitialize = jest.fn();
                        const contrastedBackgroundColorProvider = new ContrastedBackgroundColorProvider([
                            {
                                initialize:jest.fn(),
                                getColor(){
                                    return {
                                        color:'red',
                                        done:true
                                    }
                                }
                            },
                            {
                                initialize:secondInitialize,
                                getColor(){
                                    return {
                                        color:'blue',
                                        done:false
                                    }
                                }
                            }
                        ], "", true,false);
                        contrastedBackgroundColorProvider.getColor(1);
                        contrastedBackgroundColorProvider.getColor(2);
                        expect(secondInitialize).toHaveBeenCalledWith(true,false);
                    });
                    it('should return from the next provider', () => {
                        const contrastedBackgroundColorProvider = new ContrastedBackgroundColorProvider([
                            {
                                initialize:jest.fn(),
                                getColor(){
                                    return {
                                        color:'red',
                                        done:true
                                    }
                                }
                            },
                            {
                                initialize:jest.fn(),
                                getColor(){
                                    return {
                                        color:'blue',
                                        done:false
                                    }
                                }
                            }
                        ]);
                        contrastedBackgroundColorProvider.getColor(1);
                        const color = contrastedBackgroundColorProvider.getColor(2);
                        expect(color).toBe('blue')
                    });
                });
                describe('exhausted', () => {
                    it('should return the fallback color', () => {
                        const contrastedBackgroundColorProvider = new ContrastedBackgroundColorProvider([
                            {
                                initialize:jest.fn(),
                                getColor(){
                                    return {
                                        color:'red',
                                        done:true
                                    }
                                }
                            },
                        ],"fallback");
                        contrastedBackgroundColorProvider.getColor(1);
                        const fallbackColor = contrastedBackgroundColorProvider.getColor(2);
                        expect(fallbackColor).toBe('fallback');
                    })
                });
            })
        })
        describe('after removal colors should be reused in order', () => {
            class ColorProviderFromList implements ColorProvider {
                private count = -1;
                constructor(private colors:string[]){}
                initialize(): void {
                    //
                }
                getColor(): ColorResult {
                    return {
                        color:this.colors[++this.count],
                        done:this.count === this.colors.length - 1
                    }
                }

            }
            let contrastedBackgroundColorProvider:ContrastedBackgroundColorProvider
            beforeEach(() => {
                contrastedBackgroundColorProvider = new ContrastedBackgroundColorProvider([
                    new ColorProviderFromList(["red","blue"]),
                    new ColorProviderFromList(["green","yellow"])
                ], "fallback");
                contrastedBackgroundColorProvider.getColor(1);
                contrastedBackgroundColorProvider.getColor(2);
                contrastedBackgroundColorProvider.getColor(3);
                contrastedBackgroundColorProvider.getColor(4);
            });
            it('should return in order of provided for same provider', () => {
                contrastedBackgroundColorProvider.remove(2);
                contrastedBackgroundColorProvider.remove(1);
                const reusedColor = contrastedBackgroundColorProvider.getColor(5);
                expect(reusedColor).toBe('red');
                
            });
            
            it('should return in provider order', () => {
                contrastedBackgroundColorProvider.remove(4);
                contrastedBackgroundColorProvider.remove(2);
                const reusedColor = contrastedBackgroundColorProvider.getColor(5);
                expect(reusedColor).toBe('blue');
            });

            it('should not reuse when has been reused', () => {
                contrastedBackgroundColorProvider.remove(1);
                contrastedBackgroundColorProvider.getColor(5);
                const expectedFallback = contrastedBackgroundColorProvider.getColor(6);
                expect(expectedFallback).toBe('fallback');
            })
        })
    })
})