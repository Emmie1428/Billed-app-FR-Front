/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router";

jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then letter icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect (mailIcon).toBeTruthy()
      expect(mailIcon.className).toContain('active-icon')
    })
  })
  describe("When I upload a file with invalid extension", () => {
    test("Then an error message should appear", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'test@test.com'
      }))
      document.body.innerHTML = NewBillUI()
      window.alert = jest.fn()
      const newBill = new NewBill({
        document: document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage
      })
      const file = new File(['test'], 'document.pdf', { type: 'document/pdf' })
      const fileInput = document.querySelector(`input[data-testid="file"]`)
      Object.defineProperty(fileInput, 'files', {
        value: [file]
      })
      const mockEvent = {
        preventDefault: jest.fn(),
        target: { 
          value: "document.pdf",
          files: [file]
        }
      }
      newBill.handleChangeFile(mockEvent)
      expect(window.alert).toHaveBeenCalledWith("Format invalide, veuillez sélectionner un fichier .jpg, .jpeg ou .png")
      expect(mockEvent.target.value).toBe("")
    })
  })
  describe("When I upload a file with valid extension", () => {
  test("Then the file should be uploaded", () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: 'test@test.com'
    }))
    document.body.innerHTML = NewBillUI()
    
    const mockUploadFile = jest.fn().mockResolvedValue({
      fileUrl: "exemple.jpg",})
    
    const mockStore = {bills: jest.fn(() => ({
        upLoadFile: mockUploadFile }))
    }
    const newBill = new NewBill({document: document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage})
    const file = new File(['test'], 'exemple.jpg', { type: 'exemple/jpeg' })

    const fileInput = document.querySelector(`input[data-testid="file"]`)
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
      configurable: true
    })
    
    const mockEvent = { preventDefault: jest.fn(),
      target: {
        value: "C:\\fakepath\\image.jpg",
        files: [file]
      }
    }
    
    newBill.handleChangeFile(mockEvent)
    expect(mockUploadFile).toHaveBeenCalled()
    })
  })
  describe("When I submit a new bill", () => {
  test("Then bills should be updated and navigate to bills page", () => {
    document.body.innerHTML = NewBillUI()
    
    const mockUpdate = jest.fn().mockResolvedValue({})
    const mockStore = { bills: jest.fn(() => ({
        update: mockUpdate}))
    }
    const onNavigate = jest.fn()
    const newBill = new NewBill({document: document, onNavigate: onNavigate, store: mockStore, localStorage: window.localStorage})
 
    const form = screen.getByTestId("form-new-bill")
    fireEvent.submit(form)
    
    expect(mockUpdate).toHaveBeenCalled()
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"])
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I upload a file (POST)", () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "test@test.com"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.innerHTML = ""
      document.body.appendChild(root)
      router()
    })

    test.each([['404', 'Erreur 404'], ['500', 'Erreur 500']])
    ('Then upload file fails with %s error', async (errorCode, errorMessage) => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          upLoadFile: jest.fn(() => Promise.reject(new Error(errorMessage)))
        }
      })
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick)
      document.body.innerHTML = NewBillUI()
      
      const newBill = new NewBill({document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage})
      const file = new File(['test'], 'exemple.jpg', { type: 'exemple/jpeg' })
      const fileInput = screen.getByTestId("file")
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })

      const mockEvent = {preventDefault: jest.fn(),
        target: { 
          value: "exemple.jpg",
          files: [file]
        }
      }
      const consoleErrorMsg = jest.spyOn(console, 'error').mockImplementation()
      newBill.handleChangeFile(mockEvent)
      await new Promise(process.nextTick)
      expect(consoleErrorMsg).toHaveBeenCalledWith(new Error(errorMessage))
      consoleErrorMsg.mockRestore()
    })
  })
})