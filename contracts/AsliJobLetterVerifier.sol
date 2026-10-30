// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AsliJobLetterVerifier
 * @notice Verifiable Onchain Job Offer Registry for AsliJob
 * @author Saurabh Yadav (saurabhyadav@cake.cash)
 * @dev Deployed on Sepolia: 0x6Fbc36723310fec0489Ec946A1975d68cAA1D50f
 * Tx: 0xa910e4ded6de19828499c9a4c2979032cad12fe643fb561668df35f05586fea1
 */
contract AsliJobLetterVerifier {
    address public immutable owner;

    struct LetterRecord {
        bytes32 letterHash;
        string company;
        string role;
        uint64 timestamp;
        bool exists;
    }

    struct Batch {
        bytes32 merkleRoot;
        uint64 timestamp;
        uint32 letterCount;
    }

    mapping(bytes32 => LetterRecord) public verifiedLetters;
    mapping(uint256 => Batch) public batches;
    uint256 public batchCount;

    event LetterIssued(bytes32 indexed letterHash, string company, string role, uint64 timestamp);
    event BatchCommitted(uint256 indexed batchId, bytes32 indexed merkleRoot, uint32 letterCount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only AsliJob admin can issue letters");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueLetter(
        bytes32 _letterHash,
        string calldata _company,
        string calldata _role
    ) external onlyOwner {
        require(!verifiedLetters[_letterHash].exists, "Letter already verified onchain");

        verifiedLetters[_letterHash] = LetterRecord({
            letterHash: _letterHash,
            company: _company,
            role: _role,
            timestamp: uint64(block.timestamp),
            exists: true
        });

        emit LetterIssued(_letterHash, _company, _role, uint64(block.timestamp));
    }

    function commitBatch(bytes32 _merkleRoot, uint32 _letterCount) external onlyOwner returns (uint256) {
        batchCount++;
        batches[batchCount] = Batch({
            merkleRoot: _merkleRoot,
            timestamp: uint64(block.timestamp),
            letterCount: _letterCount
        });

        emit BatchCommitted(batchCount, _merkleRoot, _letterCount);
        return batchCount;
    }

    function isLetterAuthentic(bytes32 _letterHash) external view returns (bool, string memory, string memory, uint64) {
        LetterRecord memory record = verifiedLetters[_letterHash];
        return (record.exists, record.company, record.role, record.timestamp);
    }
}
