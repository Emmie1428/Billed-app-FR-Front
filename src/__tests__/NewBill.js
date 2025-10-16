/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill, {handleChangeFile} from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router";

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
  describe("When I click on «Choisir un fichier» button", () => {
    test("Then then only jpg, jpeg or png files should be allowed", async () => {
      const newBill = new NewBill({document: document, onNavigate: jest.fn(),
      store: null,
      localStorage: null
      })
      const codeSource = newBill.handleChangeFile.toString()
      expect(codeSource).toContain('["jpg", "jpeg", "png"]')
      expect(codeSource).toContain("Format invalide, veuillez sélectionner un fichier .jpg, .jpeg ou .png")
    })
  })
})
