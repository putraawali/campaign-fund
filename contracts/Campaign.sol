// SPDX-License-Identifier: MIT
 
pragma solidity 0.8.19;
 
contract DonationCampaign {    
    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool complete;
        bool isAccepted;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;
    Request[] public requests;

    modifier restricted()  {
        require(msg.sender == manager, "Manager access only");
        _;
    }

    constructor(uint minimum) {
        manager = msg.sender;
        minimumContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution, "Not reaching out the minimum contribution amount");

        // Validate that contributors are able to contribute more than 1 time, but still count as 1 approver
        if (!approvers[msg.sender]) {
            approvers[msg.sender] = true;
            approversCount++;
        }
    }

    // Make a request to spend a certain amount of money to use to develop the campaign
    function createRequest(string memory desc, uint value, address recipient) public restricted {
        require(address(this).balance >= value, "Unsufficient funds");
        require(recipient != manager, "Manager can't be the recipitient");

        Request storage req = requests.push();
        req.description = desc;
        req.value = value;
        req.recipient = payable(recipient);
    }

    // Approve request that created before by the manager
    function approveRequest(uint requestIndex, bool accept) public {
        Request storage request = requests[requestIndex];

        require(approvers[msg.sender], "You have to contribute first");
        require(!request.approvals[msg.sender], "You already approve the request");

        request.approvals[msg.sender] = accept;
        request.approvalCount++;
    }

    // Finalize request that created before by the manager
    function finalizeRequest(uint requestIndex) public restricted {
        Request storage request = requests[requestIndex];
 
        require(!request.complete, "Request is already finalized");
        require(address(this).balance >= request.value, "Unsufficient funds");
        require(request.approvalCount > (approversCount / 2), "Less than 50% of contributors doesn't approve this request yet");

        // Only transfer the funds if the request get more than 50% approval from contributors
        if (request.approvalCount > (approversCount /2)) {
            request.recipient.transfer(request.value);
            request.isAccepted = true;
        }
        
        request.complete = true;
    }
}