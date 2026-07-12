import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ShowDialogOptionsType<T> {
  defaultValues?: T;
  onSubmit?: (id: string) => void;
  editingMode?: boolean;
}

interface DialogOpenContextType {
  open: boolean;
}

interface DialogDataContextType<TDefaultValues> {
  defaultValues: TDefaultValues | null;
  onSubmit?: (id?: string) => void;
  editingMode: boolean;
}

interface DialogActionsContextType<TDefaultValues> {
  showDialog: (options: ShowDialogOptionsType<TDefaultValues>) => void;
  hideDialog: () => void;
}

export function createDialogContext<TDefaultValues>() {
  const OpenContext = createContext<DialogOpenContextType | null>(null);
  const DataContext =
    createContext<DialogDataContextType<TDefaultValues> | null>(null);
  const ActionsContext =
    createContext<DialogActionsContextType<TDefaultValues> | null>(null);

  const Provider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [defaultValues, setDefaultValues] = useState<TDefaultValues | null>(
      null,
    );
    const [editingMode, setEditingMode] = useState(false);
    const [onSubmit, setOnSubmit] = useState<
      ((id?: string) => void) | undefined
    >();

    const showDialog = useCallback(
      ({
        defaultValues,
        onSubmit,
        editingMode,
      }: ShowDialogOptionsType<TDefaultValues>) => {
        setDefaultValues(defaultValues ?? null);
        setOnSubmit(() => onSubmit); // مهم: wrap توی تابع تا به‌عنوان مقدار (نه updater) ذخیره بشه
        setEditingMode(editingMode ?? false);
        setOpen(true);
      },
      [],
    );

    const hideDialog = useCallback(() => {
      setOpen(false);
      // پاک کردن دیتا موقع بسته شدن، تا closure/رفرنس قدیمی نگه داشته نشه
      setDefaultValues(null);
      setOnSubmit(undefined);
      setEditingMode(false);
    }, []);

    // آبجکت‌های پایدار برای Context — فقط وقتی رمانده می‌کنن که مقدارشون واقعاً عوض شده باشه
    const openValue = useMemo(() => ({ open }), [open]);
    const dataValue = useMemo(
      () => ({ defaultValues, editingMode, onSubmit }),
      [defaultValues, editingMode, onSubmit],
    );
    const actionsValue = useMemo(
      () => ({ showDialog, hideDialog }),
      [showDialog, hideDialog],
    );

    return (
      <OpenContext.Provider value={openValue}>
        <DataContext.Provider value={dataValue}>
          <ActionsContext.Provider value={actionsValue}>
            {children}
          </ActionsContext.Provider>
        </DataContext.Provider>
      </OpenContext.Provider>
    );
  };

  const useDialogOpen = () => {
    const ctx = useContext(OpenContext);
    if (!ctx)
      throw new Error("useDialogOpen باید داخل Provider مربوطه استفاده بشه");
    return ctx;
  };

  const useDialogData = () => {
    const ctx = useContext(DataContext);
    if (!ctx)
      throw new Error("useDialogData باید داخل Provider مربوطه استفاده بشه");
    return ctx;
  };

  const useDialogActions = () => {
    const ctx = useContext(ActionsContext);
    if (!ctx)
      throw new Error("useDialogActions باید داخل Provider مربوطه استفاده بشه");
    return ctx;
  };

  return { Provider, useDialogOpen, useDialogData, useDialogActions };
}
