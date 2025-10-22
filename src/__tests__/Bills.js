/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router";

jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect (windowIcon).toBeTruthy()
      expect(windowIcon.className).toContain('active-icon')
      //to-do write expect expression DONE

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a - b))
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I click on add a new bill button" , () => {
    test("Then a new bill form should appear", () => {
       const onNavigate = jest.fn()
      document.body.innerHTML = BillsUI({ data: bills })
    
      const store = null
      const billsContainer = new Bills({document, onNavigate, store, localStorage: window.localStorage
    })
    const btnNewBill = screen.getByTestId('btn-new-bill')
    userEvent.click(btnNewBill)

    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })
  })
  describe('When I click on the icon eye', () => {
    test('A modal should open', () => {
      $.fn.modal = jest.fn()
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const billsFocus = new Bills ({document, onNavigate, store, localStorage: window.localStorage
    })
      const iconEyes = screen.getAllByTestId('icon-eye')
      const iconEye = iconEyes[0]
      const handleClickIconEye = jest.fn((e) => {
      billsFocus.handleClickIconEye(iconEye)
    })
    iconEye.addEventListener('click', handleClickIconEye)
    userEvent.click(iconEye)
    expect(handleClickIconEye).toHaveBeenCalled()
    expect($.fn.modal).toHaveBeenCalledWith('show')
    })
  })

})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee"}));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const billTable  = await screen.findByTestId("tbody")
      expect(billTable).toBeTruthy()
      const eyeIcons = screen.getAllByTestId("icon-eye")
      expect(eyeIcons.length).toBeGreaterThan(0)
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.findByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.findByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})
