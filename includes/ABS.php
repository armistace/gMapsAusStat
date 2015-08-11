<?php
class ABS{

    //set the class variables
    //$dataSetId is one of the datasets available at http://stat.abs.gov.au/itt/query.jsp?method=GetDatasetList
    public $dataSetId;

    //concepts and concept Codes are going to be complicated
    //I will build this to accept any value in both these 
    //but they will need to be explicityly known as to which is correct
    //value to put here as per the ABS docs http://stat.abs.gov.au/itt/r.jsp?api
    //I think they will have to be arrays that the user fills in depending on the dataSetId
    public $concepts;
    public $conceptCodes;

    //In my case this will either be the latest date, which is default or the whole dataset
    //theoritically it could be any year available in the dataset
    public $yearValue = "none";

    //In my case this will almost exclusively be JSON - hence the default
    //but I will build it to accept any of the formats available from the ABS
    public $format = "json";

    //this is the url that will be built by BuildURL() 
    public $url;

    //this is the public variable that we load the json into
    public $json;

    /**
     * getDataURL()
     * this will build the url to retreieve data from GetGenericData based on the values provided
     *
     */
    function getDataURL(){

        //set down the selected dataset ID
        $this->url = "http://stat.abs.gov.au/itt/query.jsp?method=GetGenericData&datasetid=" . $this->dataSetId . "&and=";

        //loop through the concepts and concepts codes that were provided
        if(is_array($this->concepts) && is_array($this->conceptCodes) && count($this->concepts) == count($this->conceptCodes))
        {
            //This allows me to loop through multiple array in a for each - I don't know yet if my thinking will work
            $i = 0;

            //lets look at each concept
            foreach($this->concepts as $concept)
            {
                //write the concept and concept code
                $this->url .= $concept . "." . $this->conceptCodes[$i];

                //advance $i
                $i++;

                //check if we are at the end of the string as we do not want a comma on the last one
                if ($i < count($this->concepts))
                {
                    $this->url .= ",";
                }
            }
        }

        //just in case there is some weird thing happening with what was provided to the class
        else
        {
            echo "There is an error in the concepts and conceptCode arrays. The GenericData URL can not be built";
        }

        //year value is flagged none by default if nothing assume we want latest
        //else add the year value
        if($this->yearValue == "none")
        {
            $this->url .= "&&series=latest";
        }
        else
        {
            $this->url .= "&&start=" . $this->yearValue;
        }

        //add the requested format this defaults to JSON
        $this->url .= "&format=" . $this->format;
    }

    /**
     * loadJSON()
     * this loads the json from the URL build in getDataURL()
     */
    function loadJSON(){
        if (isset($this->url))
        {
            $this->json = file_get_contents($this->url);
        }
        else
        {
            echo "URL not set";
        }
    }

    /**
     * serveJSON()
     * This function serves the JSON to an output file - defualt would be a web page
     */
    function serveJSON(){
        if (isset($this->json))
        {
            header("Content-type: application/json");
            print($this->json);
        }
        else
        {
            echo "no json is loaded";
        }
    }

    /*
     * defaultConcepts()
     * Because building the function array each time is boring
     * and can be handled automagically.
     * Careful though it is suggested that you build a test script 
     * to ensure that the order you provide $conceptCodes is correct otherwise
     * this will fail
     */

    function defaultConcepts(){
        //build the url to query the ABS api with based on the requested $dataSetId
        $conceptURL = "http://stat.abs.gov.au/itt/query.jsp?method=GetDatasetConcepts&datasetid=" . $this->dataSetId;

        //grab the data
        $conceptData = file_get_contents($conceptURL);

        //decode it to prepare to build the array
        $conceptJSON = json_decode($conceptData, TRUE);
        
        //discard the information we don't care about
        $conceptsSelect = $conceptJSON["concepts"];

        //set the array
        $conceptBuilder = array();

        //build the array
        foreach($conceptsSelect as $concept)
        {
            array_push($conceptBuilder, $concept);
        }

        //set $concepts
        $this->concepts = $conceptBuilder;

    }


}

