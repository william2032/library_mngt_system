class Book {
    constructor(
        public id: number,
        public title: string,
        public author: string,
        public borrowedBy: number | null
    ) {
    }
}

class Member {
    public borrowedBooksId: number[] = [];

    constructor(
        public id: number,
        public name: string) {
    }
}

let book: Book[] = [

    new Book(1, "Algorithms For Dummies", "John Paul Mueller", null),
    new Book(2, "Algorithms to Live By", "Brian Christian", null),
    new Book(3, "The Pragmatic Programmer", "Andrew Hunt & David Thomas", null),
    new Book(4, "Introduction to Computing Systems", "Yale Patt", null),
    new Book(5, "Computer Systems: Digital Design and Fundamentals", "Author Unknown", null),
    new Book(6, "Computer Science Illuminated", "Nell Dale", null),
    new Book(7, "Data Structures and Algorithms Made Easy", "Narasimha Karumanchi", null),
    new Book(8, "Efficient Caching Algorithms", "Author Unknown", null),
    new Book(9, "Computer Organization and Design", "David A. Patterson", null),
]

let books: Book[] = JSON.parse(localStorage.getItem('books') || 'null') || [];
let members: Member[] = JSON.parse(localStorage.getItem('members') || '[]');
let bookId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
let memberId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;

const bookForm = document.getElementById("bookForm") as HTMLFormElement;
const bookTitle = document.getElementById("bookTitle") as HTMLInputElement;
const bookAuthor = document.getElementById("bookAuthor") as HTMLInputElement;
const bookTable = document.getElementById("bookTable") as HTMLElement;

const memberForm = document.getElementById("memberForm") as HTMLFormElement;
const memberName = document.getElementById("memberName") as HTMLInputElement;
const memberTable = document.getElementById("memberTable") as HTMLElement;


// render books
function renderBooks() {
    bookTable.innerHTML = '';
    books.forEach(book => {
        const row = document.createElement("tr");
        const borrower = members.find(m => m.id === book.borrowedBy);
        row.innerHTML = `
            <td data-label="Title">${book.title}</td>
            <td data-label="Author">${book.author}</td>
            <td data-label="Status">${borrower ? 'Borrowed by ' + borrower.name : 'Available'}</td>
            <td><button class="delete-book" data-id="${book.id}">Remove</button></td>
        `;
        bookTable.appendChild(row);
    });


    //delete book
    document.querySelectorAll('.delete-book').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id')!);
            deleteBook(id);
        });
    });

}

//add books
bookForm.onsubmit = (e: SubmitEvent) => {
    e.preventDefault()
    if (!bookTitle.value.trim() || !bookAuthor.value.trim()) {
        alert("Please enter a valid title and author");
        return;
    }
    books.push(new Book(bookId++, bookTitle.value, bookAuthor.value, null));
    bookForm.reset();
    renderBooks();
    renderMembers();
}


function deleteBook(id: number) {
    books = books.filter(book => book.id !== id);
    members.forEach(member => {
        member.borrowedBooksId = member.borrowedBooksId.filter(bookId => bookId !== id);
    });
    renderBooks();
    renderMembers();
}

//borrow book
function borrowBook(memberId: number, bookId: number) {
    const member = members.find(m => m.id === memberId);
    const book = books.find(b => b.id === bookId);

    if (member && book && book.borrowedBy === null) {
        member.borrowedBooksId.push(book.id);
        book.borrowedBy = member.id;
        renderBooks();
        renderMembers();
    }
}

function getBookOptions(memberId: number): string {
    const options = books.filter(b => b.borrowedBy === null).map(b => `
    <option value="${b.id}">${b.title}</option> `
    ).join('');
    return options ? `
    <select onchange="borrowBook(${memberId}, parseInt(this.value))">
        <option disabled selected> Borrow Book</option>
        ${options}
     </select> ` : 'No Books Left';
}

//return books
function returnBook(memberId: number) {
    const member = members.find(m => m.id === memberId);

    if (member) {
        member.borrowedBooksId.forEach(bookId => {
            const book = books.find(b => b.id === bookId);
            if (book) book.borrowedBy = null;
        });
        member.borrowedBooksId = []
        renderMembers();
        renderBooks();
    }
}

//displays members
function renderMembers() {
    memberTable.innerHTML = ' ';
    if (members.length === 0) {
        memberTable.innerHTML = '<tr><td colspan="3"> No Members data available</td></tr>';
    }
    members.forEach(member => {
        const borrowedBooks = member.borrowedBooksId.map(id => books.find(b => b.id === id)?.title)
            .filter(Boolean).join(', ')
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${member.name}</td>
          <td>${borrowedBooks || 'No books borrowed'}</td>
            <td>
               ${getBookOptions(member.id)}
        <button onclick="returnBook(${member.id})">Return All</button>
        <button onclick="deleteMember(${member.id})">Delete</button>
      </td>
`;
        memberTable.appendChild(row);
    });

//add member
    memberForm.onsubmit = (e: SubmitEvent) => {
        e.preventDefault();
        if (!memberName.value.trim()) {
            alert("Please enter a valid name");
            return;
        }
        members.push(new Member(memberId++, memberName.value));
        memberForm.reset();
        renderMembers();
    };
}

//delete a member
function deleteMember(id: number) {
    const member = members.find(m => m.id === id);
    if (!member) return;

    if (confirm(`Are you sure to delete ${member.name}?`)) {
        member.borrowedBooksId.forEach(bookId => {
            const book = books.find(b => b.id === bookId);
            if (book) book.borrowedBy = null;
        })

        members = members.filter(m => m.id !== id)
        renderMembers();
        renderBooks();
    }

}

renderBooks();
renderMembers();