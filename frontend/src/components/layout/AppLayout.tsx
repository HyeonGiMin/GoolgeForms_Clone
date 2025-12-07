// AppLayout.tsx - 기본 레이아웃(헤더/메인 컨테이너)을 제공하는 컴포넌트
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";

type AppLayoutProps = {
    children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <div className="app-root">
            <Navbar bg="white" expand="lg" className="shadow-sm border-bottom">
                <Container fluid className="px-3 px-lg-4">
                    <Navbar.Brand
                        as={Link}
                        to="/forms"
                        className="fw-bold"
                        style={{ color: "#673ab7", fontSize: "1.25rem" }}
                    >
                        📋 Google Forms Clone
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="main-navbar" />
                    <Navbar.Collapse
                        id="main-navbar"
                        className="justify-content-end"
                    >
                        <Nav className="gap-2">
                            <Nav.Link
                                as={NavLink}
                                to="/forms"
                                className="px-3 py-2 rounded"
                            >
                                📁 내 폼
                            </Nav.Link>
                            <Nav.Link
                                as={NavLink}
                                to="/forms/new"
                                className="px-3 py-2 rounded"
                            >
                                ➕ 새 폼
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container fluid className="app-main px-3 px-lg-4">
                {children}
            </Container>
        </div>
    );
};
