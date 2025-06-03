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
    constructor(
        public id: number,
        public name: string,
        public borrowedBookId: number | null
    ) {
    }
}


let books: Book[] = [];
let members: Member[] = [];
let bookId = 1;
let memberId = 1;

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
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.borrowedBy !== null ? 'Borrowed' : 'Available'}</td>
            <td><button class="delete-book" data-id="${book.id}">Remove</button></td>
        `;
        bookTable.appendChild(row);
    });

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

//delete book
function deleteBook(id: number) {
    books = books.filter(book => book.id !== id);
    members.forEach(member => {
        if (member.borrowedBookId === id) member.borrowedBookId = null;
    });
    renderBooks();
    renderMembers();
}

//borrow book
function borrowBook(memberId: number, bookId: number) {
    const member = members.find(m => m.id === memberId);
    const book = books.find(b => b.id === bookId);
    if (member && book && book.borrowedBy === null) {
        member.borrowedBookId = book.id;
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
     </select> ` : 'Add Book';
}

//return books
function returnBooks(memberId: number) {
    const member = members.find(m => m.id === memberId);
    const book = books.find(b => b.id === member?.borrowedBookId)
    if (member && book) {
        member.borrowedBookId = null;
        book.borrowedBy = null;
        renderBooks();
        renderMembers();
    }
}

//displays members
function renderMembers() {
 memberTable.innerHTML = '';
 members.forEach(member => {
     const  borrowedBook = books.find(b => b.id === member.borrowedBookId);
     const row = document.createElement("tr");
     row.innerHTML = `
        <td>${member.name}</td>
          <td>${ borrowedBook ? borrowedBook.title : 'No Book'}</td>
            <td>
                  ${ borrowedBook? `<button onclick="returnBooks(${member.id})">Return</button>`  : getBookOptions(member.id) }
             <button onclick="deleteMember(${member.id})">Delete</button>
             </td>
`;
     memberTable.appendChild(row);
 });

//add member
memberForm.onsubmit = (e: SubmitEvent) => {
        e.preventDefault();
        members.push(new Member(memberId++, memberName.value, null));
        memberForm.reset();
        renderMembers();
    };
}
//delete a member
function deleteMember(id: number) {
    const member = members.find(m => m.id === id) ;
    if( !member) return;
    if (member?.borrowedBookId !== null) {
        const book = books.find(b => b.id === member.borrowedBookId);
        if (book) book.borrowedBy = null;
    }
    members = members.filter(m => m.id !== id)
    renderMembers();
    renderBooks();
}

renderBooks();
renderMembers();