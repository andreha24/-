// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DigitalLibrary {
        struct Book {
        string title;
        string author;
        address owner;
        uint256 price;
        bool isAvailable;
        string contentHash;
    }

    mapping(uint256 => Book) public books;
    uint256 public bookCount;

    event BookRegistered(uint256 indexed bookId, string title, address owner);
    event BookSold(uint256 indexed bookId, address indexed buyer, uint256 price);
    event BookStatusChanged(uint256 indexed bookId, bool isAvailable);

    modifier onlyBookOwner(uint256 _bookId) {
        require(msg.sender == books[_bookId].owner, "Not the book owner");
        _;
    }

    modifier bookAvailable(uint256 _bookId) {
        require(books[_bookId].isAvailable, "Book is not available");
        require(books[_bookId].price > 0, "Book price not set");
        _;
    }

    function registerBook(
        string memory _title,
        string memory _author,
        uint256 _price,
        string memory _contentHash
    ) public returns (uint256) {
        bookCount++;
        
        books[bookCount] = Book({
            title: _title,
            author: _author,
            owner: msg.sender,
            price: _price,
            isAvailable: true,
            contentHash: _contentHash
        });

        emit BookRegistered(bookCount, _title, msg.sender);
        return bookCount;
    }

    function buyBook(uint256 _bookId) public payable bookAvailable(_bookId) {
        Book storage book = books[_bookId];
        require(msg.value >= book.price, "Insufficient payment");
        require(msg.sender != book.owner, "Owner cannot buy own book");

        address payable previousOwner = payable(book.owner);
        
                previousOwner.transfer(msg.value);
        
                book.owner = msg.sender;
        book.isAvailable = false;

        emit BookSold(_bookId, msg.sender, msg.value);
    }

    function setBookAvailability(uint256 _bookId, bool _isAvailable) 
        public 
        onlyBookOwner(_bookId) 
    {
        books[_bookId].isAvailable = _isAvailable;
        emit BookStatusChanged(_bookId, _isAvailable);
    }

    function setBookPrice(uint256 _bookId, uint256 _newPrice) 
        public 
        onlyBookOwner(_bookId) 
    {
        books[_bookId].price = _newPrice;
    }

    function getBook(uint256 _bookId) 
        public 
        view 
        returns (
            string memory title,
            string memory author,
            address owner,
            uint256 price,
            bool isAvailable,
            string memory contentHash
        ) 
    {
        Book storage book = books[_bookId];
        return (
            book.title,
            book.author,
            book.owner,
            book.price,
            book.isAvailable,
            book.contentHash
        );
    }
}