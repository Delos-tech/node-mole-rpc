class MoleServer {
    constructor({transports}) {
        if (!transports) throw new Error('TRANSPORT_REQUIRED');
        
        this.transports = transports;
        this.methods = {};

        this._init();
    }

    expose(methods) {
        this.methods = methods;
    }

    _init() {
        for (const transport of this.transports) {
            transport.onMessage(this._processRequest.bind(this));
        }
    }

    async _processRequest(data, send) {
        const request = JSON.parse(data);
        const isRequest = request.hasOwnProperty('method');
        if ( ! isRequest ) return;

        const { method: methodName, params = [], id } = request;
        
        const method = this.methods[methodName];

        if (!method) throw new Error(`"${methodName}" is not registered`);

        const result = await method(...params);

        const response = { jsonrpc: "2.0", result, id };
        const responseData = JSON.stringify(response);
        
        return send(responseData);
    } 
}

module.exports = MoleServer;