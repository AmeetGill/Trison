import {ProcessorFunction} from "../types/ProcessorFunction";

class TunnelFactory {
    static create() {
        return {
            STTunnel :{
                with:{
                    tunnelId: {
                        preProcessor:{

                        },
                        and: {
                            preProcessor: {

                            }
                        },
                        only: {

                        }
                    },
                    preProcessor: (preProcessor: ProcessorFunction) => {

                    },
                    worker: {

                    }
                }
            },
            ConditionalTunnel: {
                preProcessor: {

                },
                worker: {

                }
            }
        }
    }
}