class ApiResponse{
    constructor(statusCode,data,message="Success"){
      this.statusCode = statusCode;
      this.data = data; //Stores the response data.
      this.message = message;
      this.success = statusCode < 400; //only for this code there is success
      //A boolean flag indicating whether the response is successful. It is set to true if the statusCode is less than 400 (indicating a successful response), and false otherwise.
    }

}

export{ApiResponse}