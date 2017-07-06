<?php
    header("Content-type: application/json; charset=utf-8"); //that's required to return any JSON data
    if(isset($_POST, $_POST['A'], $_POST['B']))
        exit("GOOD JOB");
    else
        exit("INVALID REQUEST.");
?>